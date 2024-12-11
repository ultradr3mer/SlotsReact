import { Button, Layout, Menu, Row, Col, Avatar, Space, Dropdown, theme } from 'antd';
import React, { Fragment, useState } from 'react';
import { DownOutlined, SmileOutlined } from '@ant-design/icons';
import { PersonCircle, GearFill, Magic, PlayCircle, House, SquareFill, Basket2Fill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { SlotThemeConfig } from '../canvas/skins/SlotThemeConfig';

function AppHeader(params: any) {
  const [userData, setUserData] = params.userState
  const themeConfigRef = React.useRef(params.themeConfig as SlotThemeConfig);

  let itemsNeu = [
    {
      label: 'Home',
      key: 'home',
      icon: <PersonCircle />
    }]
  const [items, setMenuItems] = useState(itemsNeu)
  const { Header } = Layout;
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const navigate = useNavigate();

  const userItems = [
    {
      key: '1',
      label: "profile",
    },
    {
      key: '2',
      danger: true,
      label: 'sign out',
      onClick: params.signOut
    },
  ];

  React.useEffect(() => {

    let itemsNeu = [
      {
        label: 'Home',
        key: 'home',
        icon: <House />,
        onClick: () => { navigate('/home') }
      },
      {
        label: 'Play',
        key: 'play',
        icon: <PlayCircle />,
        onClick: () => { navigate('/play') }
      },
      {
        label: 'Theme',
        key: 'theme',
        icon: <Magic />,
        onClick: () => { navigate('/theme') }
      },
      {
        label: 'Config',
        key: 'config',
        icon: <GearFill />,
        onClick: () => { navigate('/config') }
      }
    ]
    if (userData) {
      setMenuItems(itemsNeu)
    }
  }, [userData]);

  React.useEffect(() => {
  }, [items]);

  return (
    <Header
      style={{
        display: userData != null ? 'flex' : 'none',
        alignItems: 'center',
        backgroundColor: colorBgContainer,
        flexDirection: 'row',
        justifyContent: 'center'
      }}
      className='ant-menu-horizontal light-shadow'>
      <Layout style={{
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        maxWidth: '1200px',
        background: 'none',
      }}>
        <Menu style={{
          minWidth: '60px', 
          flex: 'auto',
          display: 'flex'
        }}
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={items}
        />
        {userData != null && userData.avatar != null && (
          <div className='ellipsis'>
            <Dropdown menu={{ items: userItems }} >
              <div style={{ display: 'flex' }}>
                <div className='align-content-center'>
                  <Avatar shape="square" size={50} src={userData.avatar} />
                </div>
                <div className='ellipsis' style={{ marginLeft: '8px', marginRight: '8px' }}>
                  {userData.name}
                </div>
                <DownOutlined />
              </div>
            </Dropdown>
          </div>
        )}
      </Layout>
    </Header>
  );
};


export default AppHeader;