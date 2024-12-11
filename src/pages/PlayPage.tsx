import { Layout, theme, Breadcrumb, Card, Row, Col } from 'antd';
import React, { Fragment } from 'react';
import Canvas from '../canvas/canvas';
import { SlotThemeConfig } from '../canvas/skins/SlotThemeConfig';

const { Header } = Layout;

function PlayPage(params: any) {
  const themeConfigRef = React.useRef(params.themeConfig as SlotThemeConfig);

  return (
    <Canvas {...params} />
  );
}

export default PlayPage;