from flask import Flask,request,jsonify
from flask_cors import CORS
import pandas as pd
from datetime import datetime
import uuid,os,json
from typing import Dict
from functools import wraps

app=Flask(__name__)
CORS(app)

class DataStore:
    def __init__(self,file:str,schema:Dict):
        self.file=f'data/{file}.xlsx'
        os.makedirs('data',exist_ok=True)
        if not os.path.exists(self.file):
            pd.DataFrame(schema).to_excel(self.file,index=False)
        
    def read(self)->pd.DataFrame:
        # return pd.read_excel(self.file)
        df = pd.read_excel(self.file)
        print(df)
        df = df.apply(lambda col: col.fillna("Unknown") if col.dtype == "object" else col.fillna(0.0))
        return df

    
    def write(self,df:pd.DataFrame)->None:
        df.to_excel(self.file,index=False)
    
    def create(self,data:Dict)->Dict:
        df=self.read()
        record={**data,'id':str(uuid.uuid4()),'created_at':datetime.now().isoformat()}
        df=pd.concat([df,pd.DataFrame([record])],ignore_index=True)
        self.write(df)
        return record
    
    def update(self,id:str,data:Dict)->Dict:
        df=self.read()
        idx=df[df['id']==id].index[0]
        for k,v in data.items():
            if k in df.columns:df.at[idx,k]=v
        df.at[idx,'updated_at']=datetime.now().isoformat()
        self.write(df)
        return df.iloc[idx].to_dict()
    
    def delete(self,id:str)->None:
        df=self.read()
        df=df[df['id']!=id]
        self.write(df)

stores={
    'inventory':DataStore('inventory',{
        'id':[],'name':[],'quantity':[],'price':[],'category':[],'supplier':[],
        'reorder_point':[],'created_at':[],'updated_at':[]
    }),
    'invoices':DataStore('invoices',{
        'id':[],'invoice_number':[],'customer_name':[],'items':[],'total_amount':[],
        'date':[],'status':[],'template_id':[],'payment_status':[],'due_date':[],'notes':[]
    }),
    'sales':DataStore('sales',{
        'id':[],'invoice_id':[],'item_id':[],'quantity':[],'price':[],
        'date':[],'payment_method':[],'discount':[]
    })
}

def handle_errors(f):
    @wraps(f)
    def wrapper(*args,**kwargs):
        try:return f(*args,**kwargs)
        except Exception as e:
            return jsonify({'error':str(e)}),500
    return wrapper

@app.route('/api/<resource>',methods=['GET','POST','PUT','DELETE'])
@handle_errors
def handle_resource(resource):
    store=stores[resource]
    if request.method=='GET':
        return jsonify(store.read().to_dict('records'))
    elif request.method=='POST':
        return jsonify(store.create(request.json)),201
    elif request.method=='PUT':
        return jsonify(store.update(request.json['id'],request.json))
    elif request.method=='DELETE':
        store.delete(request.args.get('id'))
        return jsonify({'status':'success'})

@app.route('/api/dashboard')
@handle_errors
def get_dashboard():
    inv_df=stores['inventory'].read()
    inv_df['value']=inv_df['quantity']*inv_df['price']
    sales_df=stores['sales'].read()
    
    return jsonify({
        'totalSales':float(sales_df['price'].sum()),
        'totalInventory':int(inv_df['quantity'].sum()),
        'inventoryValue':float(inv_df['value'].sum()),
        'topProducts':sales_df.merge(inv_df,left_on='item_id',right_on='id')
            .groupby('name')['quantity'].sum().nlargest(5).to_dict(),
        'salesByDay':sales_df.groupby('date')['price'].sum().to_dict()
    })

if __name__=='__main__':
    app.run(debug=True)