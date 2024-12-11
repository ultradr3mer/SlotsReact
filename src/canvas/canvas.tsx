import React, { Fragment, ReactNode, useRef, useState } from 'react';
import { SlotGame, GameState } from './SlotGame';
import drawloop from './draw';
import initializeRessources, { IRessources, IRessourcesColors, createIconColors } from './ressources';
import { theme, Layout, Collapse, InputNumber, message, ConfigProvider, Typography } from 'antd';
import { round, glColorFromRgbString, glColorFromRgbaString } from '../util/SlotsUtil';
import AdjustedXCurrency from '../components/AdjustedXCurrency'
import { ICustomToken, SlotThemeConfig } from './skins/SlotThemeConfig';
import IRound from '../data/IRound';
import moment from 'moment';
import { SpecialTileId, mapIconId } from './SlotTile';

interface ICanvasContext {
  canvasElement: Element
  ressources: IRessources
  gamedata: SlotGame
  gl: WebGLRenderingContext
}

interface IResult {
  newBalance: number
  result: number[][]
  groupData: IGroupData[]
  gameRound: IRound,
  specialTiles: SpecialTileId[],
}

interface IGroupData {
  value: number
  points: number[][]
  win: number
}


function Canvas(params: any) {
  const { Text, Link } = Typography;
  const canvasRef = React.createRef<HTMLCanvasElement>();
  const requestRef = React.useRef(0);
  const previousTimeRef = React.useRef(0);
  const [messageApi, contextHolder] = message.useMessage();
  const contextRef = React.useRef(null as unknown as ICanvasContext)
  const gameRef = React.useRef(null as unknown as SlotGame)
  const [tokenValue, setToken] = params.tokenState
  const [roundData, setRoundData] = params.roundState
  const [userData, setUserData] = params.userState

  const [themeValue, setTheme] = params.themeState;
  const themeConfigRef = React.useRef(params.themeConfig as SlotThemeConfig);
  const [themeToken, setThemeToken] = useState(themeConfigRef.current.token);
  const [isInitializedValue, setIsInitialized] = useState(false);
  const insertRef = React.createRef<HTMLInputElement>();
  const [elapsedSeconds, setElapsedSeconds] = useState("0:00");

  React.useEffect(() => {
    if (userData == null)
      return

    let context = contextRef.current

    if (canvasRef.current != null && (context?.gl == undefined || canvasRef.current != context?.gl.canvas)) {
      var canvasElement = canvasRef.current as Element;
      let ressources = initializeRessources(canvasElement, generateColors());
      let gl = ressources.gl;
      let gamedata = new SlotGame(ressources);

      context = { canvasElement, ressources, gamedata, gl }
      context.ressources.token = generateColors()
      gameRef.current = gamedata

      setThemeToken(themeConfigRef.current.token)

      if(roundData == null && tokenValue)
      {
        startRound(tokenValue, params.apiEndpoint)
      }
    }

    contextRef.current = context

    requestRef.current = requestAnimationFrame(time => animate(time, context));

    return () => {
      cancelAnimationFrame(requestRef.current);
    }
  }, [userData]);

  React.useEffect(() => {
    if(roundData == null)
      return

    const interval = setInterval(() => {
      let seconds = moment().diff(roundData.startDate, 'seconds')
      setElapsedSeconds(moment.duration(-seconds, "seconds").humanize(true))
    }, 1000);

    return () => clearInterval(interval);
  }, [roundData]);

  React.useEffect(() => {
  }, [tokenValue, isInitializedValue, elapsedSeconds]);

  let animate = (time: number, data: ICanvasContext) => {
    gameRef.current.gameloop(time);
    drawloop(data.gamedata, data.ressources, time);

    if(roundData != null)
    {

    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(time => animate(time, data));

    if (!isInitializedValue)
      setIsInitialized(data.gamedata.gameProceessedFrames > 2)
  }

  function generateColors(): IRessourcesColors {
    let token = themeConfigRef.current.token

    let {
      colorBgLayout,
      colorPrimary,
      colorPrimaryBright,
      colorBgContainer,
      colorSlotDarkBorder,
      colorContrastColor,
      colorSlotShadow
    } = token;

    return {
      primary: glColorFromRgbString(colorPrimary),
      primaryBright: glColorFromRgbString(colorPrimaryBright),
      groupColors: [glColorFromRgbString('#ffb73e'),
      glColorFromRgbString('#00c7ff'),
      glColorFromRgbString('#42e96f'),
      glColorFromRgbString('#ff48b2')],
      background: glColorFromRgbString(colorBgLayout),
      backgroundElevated: glColorFromRgbString(colorBgContainer),
      colorSlotDarkBorder: glColorFromRgbaString(colorSlotDarkBorder),
      colorContrastColor: glColorFromRgbaString(colorContrastColor),
      colorSlotShadow: glColorFromRgbaString(colorSlotShadow),
      iconColors: createIconColors(),
      tileSkin: themeConfigRef.current.getTileSkin()
    }
  }

  function canvasClick() {
    if (!tokenValue || roundData == null)
      return

    let state = gameRef.current.gameClick()
    if (state == GameState.Started) {
      fetchResult(tokenValue, params.apiEndpoint);
      setRoundData({ ...roundData, inserts: roundData.inserts + parseFloat(insertRef.current!.value) })
    }
    else if (state == GameState.End) {
      let newUserData = { ...userData }
      let result = gameRef.current.getResult()
      newUserData.balance = result.newBalance
      setUserData(newUserData)
      setRoundData(result.gameRound)

      let data = gameRef.current
      data.groupData.forEach((item: IGroupData) => {
        messageApi.open({
          type: 'success',
          icon: (<img width={38} height={38} src={data.ressources.textures.icons[item.value].url} />),
          content: (<span style={{
            fontSize: '26px',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'baseline',
            height: '34px'
          }}>
            X{item.points.length} won: {round(item.win, 2)}<AdjustedXCurrency />
          </span>),
          className: 'win-message'
        });
      })
      data.result?.specialTiles.forEach((item: SpecialTileId) => {
        let messageText = item == SpecialTileId.Freespin ? "Freespin won" :
                              "Multiplier won"
        messageApi.open({
          type: 'success',
          icon: (<img width={38} height={38} src={data.ressources.textures.icons[mapIconId(item)].url} />),
          content: (<span style={{
            fontSize: '26px',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'baseline',
            height: '34px'
          }}>
            {messageText}
          </span>),
          className: 'win-message'
        });
      })
    }
  }

  async function startRound(token: string, apiEndpoint: string) {
    let query = apiEndpoint + "/Slot/NewRound"
    let headers = {
      'Authorization': 'Bearer ' + token,
    }

    let resp = await fetch(query, {
      method: "GET",
      headers: headers
    })

    let response = await resp.json();
    setRoundData(response)
  }

  async function fetchResult(token: string, apiEndpoint: string) {
    let query = apiEndpoint + "/Slot/NewSpin?spinValue="+insertRef.current?.value
    let headers = {
      'Authorization': 'Bearer ' + token,
    }

    let resp = await fetch(query, {
      method: "GET",
      headers: headers
    })

    let response = await resp.json();

    gameRef.current.setResult(response)
  }

  return (
    <Fragment>
      <ConfigProvider
        theme={{
          token: {
            colorBgElevated: themeConfigRef.current.token.colorPrimaryBright,
            colorText: themeToken.colorBlack
          },
        }}>
        {contextHolder}
      </ConfigProvider>

      <Layout style={{ flexDirection: 'row', visibility: !isInitializedValue ? "hidden" : "visible" }}>
        <div className='slotContainer responsive-direction'>
          <div className='responsive-item'>
            <Collapse
              defaultActiveKey={['1']}
              style={{ margin: '16px 16px 8px' }}
              className='light-shadow'
              items={[
                {
                  key: '1',
                  label: <span>Balance: {round(roundData?.finalBalance, 2)}<AdjustedXCurrency /></span>,
                  children: (<Fragment>
                    <div style={{ display: 'flex' }}>
                      <p style={{ marginRight: '8px' }}>Spent: {round(roundData?.inserts, 2)}</p>
                      <p style={{ marginRight: '8px' }}>Won: {round(roundData?.wins, 2)}</p>
                      {/* <p style={{ marginRight: '8px' }}>InitialBalance: {roundData?.initialBalance}</p> */}
                    </div>
                    <div>Insert <InputNumber ref={insertRef} min={0.01} max={10} defaultValue={1} /></div>
                    <p style={{fontSize:'1em',textAlign:'right'}}><Text type="secondary" >{elapsedSeconds}</Text></p>
                  </Fragment>),
                },
              ]} />
          </div>
          <div className={`slotContainerInner ${isInitializedValue ? "fadein" : ""}`}>
            <canvas ref={canvasRef} onClick={canvasClick} className="slotCanvas"></canvas>
          </div>
        </div >
      </Layout>
    </Fragment >
  );
}

export default Canvas;

export { Canvas, IGroupData, IResult };