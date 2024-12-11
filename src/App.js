import LoginComponent from './components/LoginComponent'
import CompleteLoginComponent from './components/CompleteLoginComponent'
import HomePage from './pages/HomePage'
import ThemePage from './pages/ThemePage'
import SlotConfigPage from './pages/SlotConfigPage'
import { Layout, ConfigProvider, Alert, Button } from "antd";
import AppHeader from './components/AppHeader';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';
import AuthRequired from './components/AuthRequired';
import ForwardAuthorized from './components/ForwardAuthorized';
import { ArrowRepeat, ExclamationTriangleFill } from 'react-bootstrap-icons'
import { SlotThemeConfig } from './canvas/skins/SlotThemeConfig';
import Cookies from 'universal-cookie';
import AppStyleProvider from './components/provider/AppStyleProvider'
import Canvas from './canvas/canvas';

function App() {
  const html = document.getElementById('html');
  const [userData, setUserData] = useState(null);
  const [roundData, setRoundData] = useState(null);

  const cookies = new Cookies();
  const cookieoptions = { path: '/' }
  const tokenCookieName = 'bearerToken'
  const [tokenValue, setToken] = useState(cookies.get(tokenCookieName, cookieoptions));

  const themeConfig = new SlotThemeConfig(useState)
  const [themeValue, setTheme] = useState(themeConfig.generateTheme());
  themeConfig.themeChanged = (t) => setTheme(t)

  const [warningMessageValue, setWarningMessage] = useState('');
  const controllerRef = React.useRef(new AbortController())
  const refetchHomeData = async function () {
    fetchHomeData(tokenValue, controllerRef.current.signal)
  }

  const signOut = () => {
    cookies.remove(tokenCookieName, cookieoptions)
    setUserData(null)
    setToken(null)
  }

  const config = {
    apiEndpoint: 'https://slots-api.azurewebsites.net',
    //apiEndpoint: 'https://localhost:7109',
    authRedirectUrl: window.location.origin + "/complete-login",
    userState: [userData, setUserData],
    tokenState: [tokenValue, setToken],
    themeState: [themeValue, setTheme],
    roundState: [roundData, setRoundData],
    signOut: signOut,
    refetchHomeData: refetchHomeData,
    warningMessageState: [warningMessageValue, setWarningMessage],
    themeConfig: themeConfig,
  }

  React.useEffect(() => {
    html.classList.toggle('html-light', themeConfig.isDarkMode == false)

  }, [themeValue])


  const fetchHomeData = async function (token, signal) {
    let query = config.apiEndpoint + "/home"
    let headers = {
      'Authorization': 'Bearer ' + token,
    }

    let resp = null;
    try {
      resp = await fetch(query, {
        method: "GET",
        headers: headers,
        signal: signal
      })
    }
    catch (ex) {
      if (!signal.aborted)
        throw ex;

      console.log(ex)
      return;
    }
    let response = await resp.json();
    if (signal.aborted) return
    setUserData(response)
    setRoundData(response.activeRound)
    if (signal.aborted) return
  }

  React.useEffect(() => {
    if (tokenValue) {
      cookies.set(tokenCookieName, tokenValue, cookieoptions)

      fetchHomeData(tokenValue, controllerRef.current.signal);

      return () => {
        controllerRef.current.abort()
        controllerRef.current = new AbortController()
      }
    }
  }, [tokenValue]);

  const reloadFromMessage = function () {
    window.location.reload(false);
  }

  return (
    <ConfigProvider theme={themeValue}>
      <AppStyleProvider {...config}>
        <ConfigProvider theme={{
          token: {
            colorBgLayout: 'transparent'
          }
        }}>
          <Router>
            <AppHeader {...config} />
            {warningMessageValue != null && warningMessageValue.length > 0 && (
              <div className='responsivePadding'>
                <Alert icon={<ExclamationTriangleFill />} showIcon message={warningMessageValue} type="warning" action={<Button onClick={reloadFromMessage} icon={<ArrowRepeat />}>reload</Button>} />
              </div>
            )}
            <Routes>
              <Route path="/" element={<ForwardAuthorized isAuth={tokenValue != null}><LoginComponent {...config} /></ForwardAuthorized>} />
              <Route path="/complete-login" element={<ForwardAuthorized isAuth={tokenValue != null}><CompleteLoginComponent {...config} /></ForwardAuthorized>} />
              <Route path="/home" element={<AuthRequired isAuth={tokenValue != null}><HomePage {...config} /></AuthRequired>} />
              <Route path="/play" element={<AuthRequired isAuth={tokenValue != null}><Canvas {...config} /></AuthRequired>} />
              <Route path="/theme" element={<AuthRequired isAuth={tokenValue != null}><ThemePage {...config} /></AuthRequired>} />
              <Route path="/config" element={<AuthRequired isAuth={tokenValue != null}><SlotConfigPage {...config} /></AuthRequired>} />
            </Routes>
          </Router>
        </ConfigProvider>
      </AppStyleProvider>
    </ConfigProvider>
  );
}

export default App;
