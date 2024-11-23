import { Menu } from 'antd';
import { useNavigate } from 'react-router-dom';

const Nav = ({ items }) => {
  const navigate = useNavigate();
  const menuItems = items.map((item) => ({
    key: item.path,
    label: item.label,
  }));

  return (
    <Menu
      mode="inline"
      items={menuItems}
      onClick={(e) => navigate(e.key)}
    />
  );
};

export default Nav;
