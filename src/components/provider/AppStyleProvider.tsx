import React from 'react';
import { theme, Layout, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { SlotThemeConfig } from '../../canvas/skins/SlotThemeConfig';
import { fromString } from '../../util/Color';

const useStyle = (config: SlotThemeConfig) => {
  let opacity = config.getIsDark() ? 0.3 : 0.1
  let sizeMult = 4

  return createStyles(({ css }) => ({
    style: css`
      .ant-card-head {
        background-color: ${config.token.colorBgElevated};
      }
      .ant-collapse {
        background-color: ${config.token.colorBgElevated};
      }
      .ant-collapse {
        background-color: ${config.token.colorBgElevated};
      }
      .light-shadow {
        box-shadow:
          0 ${sizeMult}px ${sizeMult*2}px 0 rgba(0, 0, 0, ${opacity}),
          0 ${sizeMult}px ${sizeMult*6}px ${-sizeMult}px rgba(0, 0, 0, ${opacity/3*2}),
          0 ${sizeMult/2*3}px ${sizeMult}px 0 rgba(0, 0, 0, ${opacity/3*2});
        z-index: 20;
      }
      .ant-menu-item:hover, .ant-menu-submenu:hover {
        background: radial-gradient(circle at bottom, 
          ${fromString(config.token.colorPrimary).multAlpha(0.54).toString()} 0%, 
          ${fromString(config.token.colorPrimary).multAlpha(0.10).toString()} 100%)
          !important
      }
    `,
  }))();
};

function AppStyleProvider(props: any) {

  const {
    token: { colorBgElevated },
  } = theme.useToken();

  const { styles } = useStyle(props.themeConfig)

  return <Layout className={`root-element ${styles.style}`} >{props.children}</Layout>
}

export default AppStyleProvider