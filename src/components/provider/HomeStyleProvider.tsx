import React from 'react';
import { theme, Layout, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { SlotThemeConfig } from '../../canvas/skins/SlotThemeConfig';
import { fromString } from '../../util/Color';
import securityPaperSrc from '../../assets/images/securityPaper.png'
import securityPaperDarkSrc from '../../assets/images/securityPaperDark.png'

const useStyle = (config: SlotThemeConfig) => {
  let primaryColorObject = fromString(config.token.colorPrimary)
  let originalRibbonHsl = fromString('#f571a2').getHsl()
  let primaryColorHsl = primaryColorObject.getHsl()
  let hueRot = 3.6 * (primaryColorHsl.h - originalRibbonHsl.h)
  let satMult = 100 * primaryColorHsl.s / originalRibbonHsl.s
  let ribbonFiter = `saturate(${satMult}%) hue-rotate(${hueRot}deg)`

  return createStyles(({ css }) => ({
    style: css`
      .homeHeaderRow {
        padding: 16px 16px 0px 16px;
        margin: 16px -16px;
        background-image: url('${config.ifDarkThenElse(securityPaperSrc, securityPaperDarkSrc)}');
      }
      
      .homeStreakButton {
        height: auto;
        padding: 2px 6px 0px 5px;
        font-size: 22px;
        align-items: baseline;
      }
      
      .homeStreakFlames {
        letter-spacing: -13px;
        margin-right: 15px
      }
      
      .homeRewardBadge {
        padding: 16px 32px;
        font-weight: 400;
        font-size: 64px;
        line-height: 36px;
        max-width: 400px;
        margin-bottom: 8px;
        position: relative;
        flex-grow: 1;
        background-color: ${config.token.colorPrimary};
        border-radius: ${config.token.borderRadius}px;
        border-bottom: 2px solid ${config.token.colorPrimaryBright};
        color: config.token.colorTextLightSolid;
        filter: drop-shadow(0px 2px 4px #000000aa)
                drop-shadow(0px 0px 12px ${config.token.colorPrimaryBright}55);
      }
      
      .homeRewardBadgeClaim {
        padding: 16px 32px;
        font-weight: 400;
        font-size: 64px;
        width: 400px;
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background-color: ${config.token.colorPrimary};
        border-radius: ${config.token.borderRadius}px;
        border-bottom: 2px solid ${config.token.colorPrimaryBright};
        color: ${config.token.colorTextLightSolid};
        filter: drop-shadow(0px 2px 4px #000000aa)
                drop-shadow(0px 0px 12px ${config.token.colorPrimaryBright}55)
      }
      
      .homeRewardBadgeClaimHead {
        font-size: 30px;
      }
      
      .homeRewardBadgeClaimValue {
        text-wrap: wrap;
        word-wrap: break-word;
      }
      
      .homePresentImg {
        width: 128px;
        height: 128px;
        position: absolute;
        top: 0px;
        left: 0px;
      }

      .homePresentBody {
        filter: drop-shadow(0px 2px 4px #0000007e)
        drop-shadow(0px 0px 12px ${config.token.colorPrimaryBright}55)
        brightness(${config.ifDarkThenElse(60, 100)}%)
      }

      .homePresentDecoration {
        filter: drop-shadow(0px 2px 4px #0000007e) ${ribbonFiter}
      }

      .ant-result {
        padding: 0;
      }

      .homeHeaderRow .slim-card {
        font-size: 22px;
      }
    `,
  }))();
};

function HomeStyleProvider(props: any) {
  const themeConfigRef = React.useRef(props.themeConfig as SlotThemeConfig);

  const { styles } = useStyle(themeConfigRef.current)

  return <div className={styles.style} >{props.children}</div>
}

export default HomeStyleProvider