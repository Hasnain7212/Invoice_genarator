from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import uuid, os, json
from typing import Dict, List, Any, Optional
from functools import wraps
from decimal import Decimal
import re

app = Flask(__name__)
CORS(app)

class FieldValidator:
    @staticmethod
    def validate_email(value: str) -> bool:
        return bool(re.match(r"[^@]+@[^@]+\.[^@]+", value))
    
    @staticmethod
    def validate_phone(value: str) -> bool:
        return bool(re.match(r"^\+?[\d\s-]{10,}$", value))
    
    @staticmethod
    def validate_gst_number(value: str) -> bool:
        return bool(re.match(r"^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$", value))
    
    @staticmethod
    def validate_pan(value: str) -> bool:
        return bool(re.match(r"[A-Z]{5}[0-9]{4}[A-Z]{1}$", value))

class DataStore:
    def __init__(self, file: str, schema: Dict, validators: Dict = None):
        self.file = f'data/{file}.xlsx'
        self.validators = validators or {}
        os.makedirs('data', exist_ok=True)
        if not os.path.exists(self.file):
            pd.DataFrame(schema).to_excel(self.file, index=False)
    
    def read(self) -> pd.DataFrame:
        df = pd.read_excel(self.file)
        # Handle JSON fields
        for col in df.columns:
            if df[col].dtype == "object":
                try:
                    df[col] = df[col].apply(lambda x: json.loads(x) if isinstance(x, str) and x.startswith('[') else x)
                except:
                    pass
        df = df.apply(lambda col: col.fillna("Unknown") if col.dtype == "object" else col.fillna(0.0))
        return df
    
    def write(self, df: pd.DataFrame) -> None:
        # Convert lists/dicts to JSON strings before saving
        for col in df.columns:
            if df[col].dtype == "object":
                df[col] = df[col].apply(lambda x: json.dumps(x) if isinstance(x, (list, dict)) else x)
        df.to_excel(self.file, index=False)
    
    def validate_field(self, field: str, value: Any) -> Optional[str]:
        if field in self.validators:
            validator = getattr(FieldValidator, self.validators[field], None)
            if validator and not validator(value):
                return f"Invalid {field} format"
        return None
    
    def validate_data(self, data: Dict) -> List[str]:
        errors = []
        for field, value in data.items():
            if error := self.validate_field(field, value):
                errors.append(error)
        return errors
    
    def create(self, data: Dict) -> Dict:
        if errors := self.validate_data(data):
            raise ValueError(f"Validation errors: {', '.join(errors)}")
        
        df = self.read()
        record = {
            **data,
            'id': str(uuid.uuid4()),
            'created_at': datetime.now().isoformat(),
            'updated_at': None
        }
        df = pd.concat([df, pd.DataFrame([record])], ignore_index=True)
        self.write(df)
        return record
    
    def update(self, id: str, data: Dict) -> Dict:
        if errors := self.validate_data(data):
            raise ValueError(f"Validation errors: {', '.join(errors)}")
        
        df = self.read()
        if not (df['id'] == id).any():
            raise ValueError(f"Record with id {id} not found")
        
        idx = df[df['id'] == id].index[0]
        for k, v in data.items():
            if k in df.columns:
                df.at[idx, k] = v
        df.at[idx, 'updated_at'] = datetime.now().isoformat()
        self.write(df)
        return df.iloc[idx].to_dict()
    
    def delete(self, id: str) -> None:
        df = self.read()
        if not (df['id'] == id).any():
            raise ValueError(f"Record with id {id} not found")
        df = df[df['id'] != id]
        self.write(df)

# Define stores with their schemas and validators
stores = {
    'categories': DataStore(
        'categories',
        {
            'id': [], 'name': [], 'description': [], 
            'parent_category': [], 'status': [],
            'created_at': [], 'updated_at': []
        }
    ),
    
    'suppliers': DataStore(
        'suppliers',
        {
            'id': [], 'name': [], 'contact_person': [], 
            'email': [], 'phone': [], 'address': [],
            'gst_number': [], 'pan_number': [], 'bank_details': [],
            'payment_terms': [], 'credit_limit': [],
            'status': [], 'created_at': [], 'updated_at': []
        },
        validators={
            'email': 'validate_email',
            'phone': 'validate_phone',
            'gst_number': 'validate_gst_number',
            'pan_number': 'validate_pan'
        }
    ),
    
    'customers': DataStore(
        'customers',
        {
            'id': [], 'name': [], 'contact_person': [],
            'email': [], 'phone': [], 'address': [],
            'gst_number': [], 'pan_number': [], 'credit_limit': [],
            'payment_terms': [], 'status': [],
            'created_at': [], 'updated_at': []
        },
        validators={
            'email': 'validate_email',
            'phone': 'validate_phone',
            'gst_number': 'validate_gst_number',
            'pan_number': 'validate_pan'
        }
    ),
    
    'inventory': DataStore(
        'inventory',
        {
            'id': [], 'name': [], 'sku': [], 'barcode': [],
            'category': [], 'suppliers': [], 'unit': [],
            'quantity': [], 'min_quantity': [], 'max_quantity': [],
            'purchase_price': [], 'selling_price': [], 'mrp': [],
            'gst_rate': [], 'hsn_code': [], 'status': [],
            'description': [], 'specifications': [],
            'created_at': [], 'updated_at': []
        }
    ),
    
    'purchase_orders': DataStore(
        'purchase_orders',
        {
            'id': [], 'po_number': [], 'supplier': [],
            'order_date': [], 'delivery_date': [], 'items': [],
            'subtotal': [], 'gst_amount': [], 'total_amount': [],
            'payment_terms': [], 'status': [], 'notes': [],
            'created_at': [], 'updated_at': []
        }
    ),
    
    'sales_orders': DataStore(
        'sales_orders',
        {
            'id': [], 'so_number': [], 'customer': [],
            'order_date': [], 'delivery_date': [], 'items': [],
            'subtotal': [], 'gst_amount': [], 'total_amount': [],
            'payment_terms': [], 'status': [], 'notes': [],
            'created_at': [], 'updated_at': []
        }
    ),
    
    'invoices': DataStore(
        'invoices',
        {
            'id': [], 'invoice_number': [], 'reference_type': [],
            'reference_id': [], 'date': [], 'due_date': [],
            'customer': [], 'billing_address': [], 'shipping_address': [],
            'items': [], 'subtotal': [], 'discount': [],
            'gst_breakdown': [], 'total_gst': [], 'total_amount': [],
            'payment_status': [], 'notes': [],
            'created_at': [], 'updated_at': []
        }
    ),
    
    'payments': DataStore(
        'payments',
        {
            'id': [], 'payment_number': [], 'date': [],
            'entity_type': [], 'entity_id': [], 'amount': [],
            'payment_method': [], 'reference_number': [],
            'notes': [], 'status': [],
            'created_at': [], 'updated_at': []
        }
    ),
    
    'tax_rates': DataStore(
        'tax_rates',
        {
            'id': [], 'name': [], 'rate': [],
            'description': [], 'status': [],
            'created_at': [], 'updated_at': []
        }
    )
}

def handle_errors(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except KeyError as e:
            return jsonify({'error': f'Invalid resource: {str(e)}'}), 404
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return wrapper

@app.route('/api/<resource>', methods=['GET', 'POST'])
@handle_errors
def handle_resource(resource):
    store = stores[resource]
    if request.method == 'GET':
        return jsonify(store.read().to_dict('records'))
    elif request.method == 'POST':
        return jsonify(store.create(request.json)), 201

@app.route('/api/<resource>/<id>', methods=['GET', 'PUT', 'DELETE'])
@handle_errors
def handle_resource_with_id(resource, id):
    store = stores[resource]
    if request.method == 'GET':
        df = store.read()
        record = df[df['id'] == id]
        if record.empty:
            return jsonify({'error': 'Record not found'}), 404
        return jsonify(record.iloc[0].to_dict())
    elif request.method == 'PUT':
        return jsonify(store.update(id, request.json))
    elif request.method == 'DELETE':
        store.delete(id)
        return jsonify({'status': 'success'})

if __name__ == '__main__':
    app.run(debug=True)