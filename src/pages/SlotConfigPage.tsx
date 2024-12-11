import {
  Layout, Breadcrumb, Card, InputNumber, Form, Space, Select, Button, Table, Col, Row
} from 'antd';
import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom'
import { Content } from 'antd/es/layout/layout';
import { SlotThemeConfig, TileSkin } from '../canvas/skins/SlotThemeConfig';
import type { ColumnsType } from 'antd/es/table';
import { X } from 'react-bootstrap-icons';
import useWindowDimensions from '../components/UseWindowDimensions';

const { Option } = Select;

interface ISlotConfigFunctionItem {
  value: string
  name: string
  description: string
}

interface ISlotConfigGroupWin {
  size: number
  probability: number
  win: number
}

interface ITableGroupWin extends ISlotConfigGroupWin {
  key: string
}

interface ISlotConfig {
  functions: ISlotConfigFunctionItem[],
  groupWins: ISlotConfigGroupWin[],
  activeIconCount: number,
  winFunction: string,
  minGroupSize: number
}



function SlotConfigPage(params: any) {
  const [slotConfigValue, setSlotConfig] = React.useState<ISlotConfig>(null as unknown as ISlotConfig);
  const [tokenValue, setToken] = params.tokenState
  const [themeValue, setTheme] = params.themeState
  const themeConfigRef = React.useRef(params.themeConfig as SlotThemeConfig);
  const { height, width } = useWindowDimensions();
  const navigate = useNavigate();

  React.useEffect(() => {
    let task = async () => {
      let query = params.apiEndpoint + "/Config"

      let headers = {
        'Authorization': 'Bearer ' + tokenValue,
      }

      let resp = await fetch(query, {
        method: "GET",
        headers: headers
      })

      let response = await resp.json();
      setSlotConfig(response)
    }
    task();
  }, [tokenValue]);

  React.useEffect(() => {
  }, [slotConfigValue, themeValue]);

  async function onFinish(values: any) {
    let query = params.apiEndpoint + "/Config/Save"

    let headers = {
      'Authorization': 'Bearer ' + tokenValue,
      'Content-Type': 'application/json',
    }

    let resp = await fetch(query, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(values)
    })

    let response = await resp.json();
    setSlotConfig({ ...slotConfigValue, ...response })
  }


  function formatNumericTableColumn(v: string) {
    let precision = width < themeConfigRef.current.token.screenSM ? 4
      : width < themeConfigRef.current.token.screenMD ? 6
      : 8
    return parseFloat(v).toPrecision(precision).toString()
  }

  const columns: ColumnsType<ITableGroupWin> = [
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Probability',
      dataIndex: 'probability',
      key: 'probability',
      render: (v) => <span>1/{formatNumericTableColumn(v)}</span>,
    },
    {
      title: 'Win',
      dataIndex: 'win',
      key: 'win',
      render: (v) => v > 0 ? (<span>{formatNumericTableColumn(v)}</span>) : <X />,
    }
  ];

  return (
    <Layout className='main-content'>
      <Card
        title={<Breadcrumb items={[{ title: 'Home' }, { title: 'Theme' }]} />}
        className='mainCard light-shadow' >
        <Content>
          {slotConfigValue != null && (
            <Fragment>
              <Form
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
                onFinish={onFinish}
                initialValues={slotConfigValue as ISlotConfig}
              >
                <Form.Item
                  label="Number of different icons"
                  name="activeIconCount"
                  extra="Number of different icons the slot machine uses. Lower numbers leads to more evenly distributed wins, while a high number results in less frequent but highter wins."
                >
                  <InputNumber
                    min={2} max={17} />
                </Form.Item>

                <Form.Item
                  label="Minimum group size to win"
                  name="minGroupSize"
                  extra="This setting determines how many matching icons you need to win. Lower numbers mean you'll win more often with smaller prizes, while higher numbers mean less frequent wins with larger prizes."
                >
                  <InputNumber
                    min={2} max={9} />
                </Form.Item>

                <Form.Item
                  label="Group size to win function"
                  name="winFunction"
                  extra="This text explains how the calculation of prize amounts is influenced by the likelihood of different group sizes. A balanced function leads to more evenly distributed wins, while a steep function results in greater variation in winnings."
                >
                  <Select
                    style={{ maxWidth: '450px' }}
                  >
                    {slotConfigValue.functions.map(f =>
                    (<Option value={f.value} label={f.name} key={f.value}>
                      <Space direction='vertical'>
                        <span role="img" aria-label={f.value}>
                          {f.name}
                        </span>
                        <span className='description-text' style={{ color: themeConfigRef.current.token.colorTextTertiary }}>
                          {f.description}
                        </span>
                      </Space>
                    </Option>))}
                  </Select>
                </Form.Item>

                <Form.Item colon={false} label=' ' className='form-item-no-label'>
                  <Col span={8}></Col>
                  <Button type="primary" htmlType="submit">
                    Apply
                  </Button>
                </Form.Item>
              </Form>

              <Table columns={columns} dataSource={slotConfigValue.groupWins.map(item => ({ ...item, key: item.size.toString() }))} pagination={false} />
            </Fragment>
          )}
        </Content>
      </Card>
    </Layout>
  );
}

export default SlotConfigPage;

