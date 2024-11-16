// components/DynamicNav.jsx
import React from 'react';
import {Layout,Menu} from 'antd';
import {Link,useLocation} from 'react-router-dom';
import * as Icons from '@ant-design/icons';

export const DynamicNav=({items})=>{
  const location=useLocation();
  return(
    <Layout.Sider>
      <div className="p-4">
        <h1 className="text-white text-xl">Admin Panel</h1>
      </div>
      <Menu theme="dark" selectedKeys={[location.pathname]} mode="inline">
        {items.map(({key,path,icon,label})=>(
          <Menu.Item key={path} icon={React.createElement(Icons[icon])}>
            <Link to={path}>{label}</Link>
          </Menu.Item>
        ))}
      </Menu>
    </Layout.Sider>
  );
};