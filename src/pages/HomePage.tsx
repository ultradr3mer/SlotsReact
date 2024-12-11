import {
  Layout, theme, Breadcrumb, Result, Button, Tag,
  Popover, ConfigProvider, Divider, Col, Row, Card
} from 'antd';
import React, { Fragment } from 'react';
import { useNavigate } from 'react-router-dom'
import { Content } from 'antd/es/layout/layout';
import AdjustedXCurrency from '../components/AdjustedXCurrency'
import { CheckCircleFilled, CloseCircleFilled, MailTwoTone } from '@ant-design/icons';
import { ArrowRightCircleFill } from 'react-bootstrap-icons';
import PresentBodySrc from '../assets/images/presentbody.png'
import PresentRibbonSrc from '../assets/images/presentribbon.png'
import SecurityPaperSrc from '../assets/images/securityPaper2.png'
import SecurityPaperDarkSrc from '../assets/images/securityPaper2Dark.png'
import AnimatedNumbers from "react-animated-numbers";
import { Color, fromString } from '../util/Color'
import Countdown from 'react-countdown';
import { SlotThemeConfig } from '../canvas/skins/SlotThemeConfig';

import { createStyles } from 'antd-style';
import HomeStyleProvider from '../components/provider/HomeStyleProvider';

function HomePage(params: any) {
  const [userData, setUserData] = params.userState
  const [tokenValue, setToken] = params.tokenState
  const [showRewardValue, setShowReward] = React.useState(true)
  const refetchHomeData = params.refetchHomeData;
  const [claimLoadingValue, setCalimLoading] = React.useState(false)
  const [warningMessageValue, setWarningMessage] = params.warningMessageState
  const [rewardInfo, setRewardInfo] = React.useState()
  const themeConfigRef = React.useRef(params.themeConfig as SlotThemeConfig);
  let apiEndpoint = params.apiEndpoint

  const { Header } = Layout;
  const navigate = useNavigate();

  function playClick() {
    navigate('/play');
  }

  React.useEffect(() => {
  }, [userData]);

  React.useEffect(() => {
  }, [showRewardValue]);

  React.useEffect(() => {
  }, [rewardInfo]);

  async function claimDaily() {
    setCalimLoading(true)

    let query = apiEndpoint + "/home/claimdaily"
    let headers = {
      'Authorization': 'Bearer ' + tokenValue,
    }

    let resp = await fetch(query, {
      method: "POST",
      headers: headers
    })

    if (resp.status != 200) {
      setWarningMessage("An error occurred while trying to claim your bonus, possibly because it has already been redeemed. Please try refreshing the page.");
    }

    let response = await resp.json();
    setRewardInfo(response)

    refetchHomeData();

    setCalimLoading(false)
  }

  async function skipDaily() {
    setShowReward(false)
  }

  if (!userData) {
    return <Fragment />;
  }

  let flameCount = Math.min(userData.dailyReward.streakCount, 3)
  let flames = "";
  for (var i = 0; i < flameCount; i++) {
    flames += '🔥'
  }

  return (
    <HomeStyleProvider {...params}>
      <Layout className='main-content'>
        <Card
          title={<Breadcrumb items={[{ title: 'Home' }, { title: 'Welcome' }]} />}
          className='mainCard light-shadow'  >
          <Content>
            {showRewardValue == true &&
              (<Fragment>
                <Row className='homeHeaderRow' >
                  <Col xs={{ span: 12, order: 1 }} lg={{ span: 6, order: 1 }} style={{ marginBottom: '16px' }} className='col-flex-justify-left'>
                    {userData.dailyReward.rewardReady == true &&
                      (<Card className='slim-card'>
                        <span>Welcome back</span>
                      </Card>
                      )}
                    {userData.dailyReward.rewardReady != true &&
                      (<Card className='slim-card'>
                        <span style={{ paddingTop: '3px' }}>
                          <span style={{ fontSize: '16px' }}>NEXT BONUS:</span> <Countdown date={Date.now() + userData.dailyReward.remainingSeconds * 1000} />
                        </span>
                      </Card>
                      )}
                  </Col>
                  <Col xs={{ span: 12, order: 2 }} lg={{ span: 6, order: 3 }} order={3} style={{ marginBottom: '16px' }} className='col-flex-justify-right'>
                    {flameCount > 0 &&
                      (<Popover content={`${userData.dailyReward.streakCount} days`} title="Streak">
                        <Button type="default" size='large' className='homeStreakButton'>
                          <span className='homeStreakFlames'>{flames}</span>{userData.dailyReward.streakCount}
                        </Button>
                      </Popover>)}
                  </Col>
                  <Col xs={{ span: 24, order: 3 }} lg={{ span: 12, order: 2 }} order={2} style={{ marginBottom: '16px' }}>
                    {userData.dailyReward.rewardReady == true && (
                      <Result
                        icon={<Fragment><div className='flexJustifyCenter'>
                          <div color='primiary' className='homeRewardBadge'>
                            <div className='presentImgContainer'>
                              <img className='homePresentImg homePresentBody' src={PresentBodySrc} />
                              <img className='homePresentImg homePresentDecoration' src={PresentRibbonSrc} />
                            </div>
                            <div className='presentTextContainer presentTextContainerGlow'>100<AdjustedXCurrency /></div>
                          </div>
                        </div>
                        </Fragment>}
                        title={<div>Your daily bonus</div>}
                        extra={<Fragment>
                          <Button size='large' onClick={claimDaily} icon={<CheckCircleFilled />} loading={claimLoadingValue} type="primary">Claim</Button>
                          <Button size='large' onClick={skipDaily} icon={<CloseCircleFilled />} type="default">Not now</Button>
                        </Fragment>}
                      />
                    )}
                    {userData.dailyReward.rewardReady != true && rewardInfo != null && (
                      <Result
                        icon={<Fragment><div style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                          <div color='primiary' className='homeRewardBadgeClaim' >
                            <div className='presentTextContainerGlow homeRewardBadgeClaimHead'>BALANCE:</div>
                            <div className='presentTextContainerGlow homeRewardBadgeClaimValue'>
                              <div style={{ display: 'inline-block' }}><AnimatedNumbers
                                animateToNumber={userData.balance}
                                configs={[{
                                  tension: 70,
                                  friction: 60,
                                }]}
                              /></div><AdjustedXCurrency /></div>
                          </div>
                        </div>
                        </Fragment>}
                        title=
                        {<Fragment>
                          <Button size='large' onClick={skipDaily} icon={<ArrowRightCircleFill />} >dismiss</Button>
                        </Fragment>}
                      />
                    )}
                  </Col>
                </Row>
                <Divider></Divider>
              </Fragment>)}
            <Button type="primary" onClick={playClick}>
              Play
            </Button>
          </Content>
        </Card>
      </Layout>
    </HomeStyleProvider>
  );
}

export default HomePage;