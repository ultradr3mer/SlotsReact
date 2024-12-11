import {
  Layout, Breadcrumb, Card, Switch, Form, Input, ColorPicker, Select
} from 'antd';
import React, { MutableRefObject, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Content } from 'antd/es/layout/layout';
import { SlotThemeConfig, TileSkin } from '../canvas/skins/SlotThemeConfig';

function ThemePage(params: any) {
  const themeConfigRef = React.useRef(params.themeConfig as SlotThemeConfig);
  const tintPickerRef = React.useRef<MutableRefObject<null>>(null);
  const [themeValue, setTheme] = params.themeState
  const [isThemeDarkValue, setThemeDarkValue] = useState(true)
  const navigate = useNavigate();

  React.useEffect(() => {
    setThemeDarkValue(themeConfigRef.current.getIsDark())
  }, [themeValue, isThemeDarkValue]);

  function playClick() {
    navigate('/play');
  }

  return (
    <Layout className='main-content'>
      <Card
        title={<Breadcrumb items={[{ title: 'Home' }, { title: 'Theme' }]} />}
        className='mainCard light-shadow'  >
        <Content>
          <Form
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 16 }}>
            <Form.Item
              label="Dark/Light"
            >
              <Switch
                checkedChildren="dark"
                unCheckedChildren="light"
                onClick={() => themeConfigRef.current.switchTheme()}
                defaultChecked={themeConfigRef.current.getIsDark()} />
            </Form.Item>

            <Form.Item
              label="Color"
              name="color"
            >
              <ColorPicker
                defaultValue={themeConfigRef.current.getAccent()}
                onChangeComplete={(value) => { themeConfigRef.current.setAccent("#" + value.toHex()) }}
                disabledAlpha showText />
            </Form.Item>

            {
              themeConfigRef.current.ifDarkThenElse(
                (<Form.Item
                  label='Background tint (dark)'
                  name="bgTint"
                >
                  <ColorPicker showText
                    defaultValue={themeConfigRef.current.token.colorBgTint}
                    onChangeComplete={(value) => { themeConfigRef.current.setBgTint("#" + value.toHex()) }}
                    disabledAlpha />
                </Form.Item>),
                (<Form.Item
                  label='Background tint (ligth)'
                  name="bgTintLight"
                >
                  <ColorPicker showText
                    defaultValue={themeConfigRef.current.token.colorBgTintLight}
                    onChangeComplete={(value) => { themeConfigRef.current.setBgTint("#" + value.toHex()) }}
                    disabledAlpha />
                </Form.Item>)) 
            }


            <Form.Item
              label="Tiles"
              name="tiles"
            >
              <Select
                defaultValue={themeConfigRef.current.getTileSkin()}
                style={{ width: 120 }}
                options={[{ value: TileSkin.Simple3d.description, label: 'Simple 3D' }, { value: TileSkin.Hologram.description, label: 'Hologram' }]}
                onChange={(value) => { themeConfigRef.current.setTileSkin(value) }}
              />
            </Form.Item>
          </Form>
        </Content>
      </Card>
    </Layout>
  );
}

export default ThemePage;