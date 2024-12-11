import React from 'react';
import { Spin, Card, Divider, Layout } from 'antd';
import { useNavigate } from "react-router-dom";

function CompleteLoginComponent(params) {
  const navigate = useNavigate();
  const [tokenValue, setToken] = params.tokenState
  const [userData, setUserData] = params.userState

  const requestdCodeRef = React.useRef(null)

  let urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get('code');

  React.useEffect(() => {
    let task = async () => {
      if (requestdCodeRef.current == code) {
        return
      }

      requestdCodeRef.current = code

      let query = params.apiEndpoint + "/Auth/CompleteLogin?code=" + code
        + "&redirectUri=" + params.authRedirectUrl;

      let resp = await fetch(query, {
        method: "GET"
      })
      let response = await resp.json();
      setToken(response.token)
    }
    task();
  }, [code]);

  return (
    <Layout className='layout-centered' style={{ flexDirection: 'row' }}>
    <Card flex='auto' 
        title="Retrieving data..." 
        className='light-shadow'
        style={{ maxWidth: '300px', flexGrow: 1 }} >
        <Layout className='layout-centered' style={{ height: '100px' }}>
          <Spin size="large" />
        </Layout>
          <Divider />
      </Card>
    </Layout>
  );
}

export default CompleteLoginComponent;
