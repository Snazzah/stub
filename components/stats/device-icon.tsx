import BlurImage from '@/components/shared/blur-image';
import {
  Android,
  Apple,
  Baidu,
  Bing,
  Bot,
  Chrome,
  Console,
  Debian,
  Desktop,
  DuckDuckGo,
  Fuchsia,
  Google,
  Insomnia,
  LinkedIn,
  Linux,
  LinuxMint,
  MetaTags,
  Mobile,
  MSEdge,
  Opera,
  Safari,
  Slack,
  Tablet,
  Telegram,
  TV,
  Ubuntu,
  UCBrowser,
  UnknownDevice,
  Wearable,
  Windows
} from '@/components/shared/icons/devices';
import { DeviceTabs } from '@/lib/stats';

import { Discord, Facebook, Twitter } from '../shared/icons';

export default function DeviceIcon({ display, tab, className }: { display: string; tab: DeviceTabs; className: string }) {
  if (display === 'Bot') return <Bot className={className} />;
  if (display === 'Unknown' || display === 'unknown') return <UnknownDevice className={className} />;
  if (tab === 'device') {
    if (display === 'Desktop' || display === 'desktop') return <Desktop className={className} />;
    else if (display === 'mobile') return <Mobile className={className} />;
    else if (display === 'tablet') return <Tablet className={className} />;
    else if (display === 'console') return <Console className={className} />;
    else if (display === 'smarttv') return <TV className={className} />;
    else if (display === 'wearable') return <Wearable className={className} />;
    else {
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/types/${display}.png`}
          alt={display}
          width={40}
          height={40}
          sizes="10vw"
          className={className}
          draggable={false}
        />
      );
    }
  } else if (tab === 'browser') {
    if (display === 'Chrome') {
      return <Chrome className={className} />;
    } else if (display === 'Safari' || display === 'Mobile Safari') {
      return <Safari className={className} />;
    } else if (display === 'UCBrowser') {
      return <UCBrowser className={className} />;
    } else if (display === 'Edge') {
      return <MSEdge className={className} />;
    } else if (display === 'Opera' || display === 'Opera Mobi' || display === 'Opera Mini' || display === 'Opera Neon' || display === 'Opera Touch') {
      return <Opera className={className} />;
    } else {
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/browsers/${display.toLowerCase()}.png`}
          alt={display}
          width={40}
          height={40}
          className={className}
          draggable={false}
        />
      );
    }
  } else if (tab === 'os') {
    if (display === 'Mac OS') {
      return <BlurImage src="/static/icons/macos.png" alt={display} width={40} height={40} className={className} draggable={false} />;
    } else if (display === 'iOS') {
      return <Apple className={className} />;
    } else if (display === 'Android') {
      return <Android className={className} />;
    } else if (display === 'Linux') {
      return <Linux className={className} />;
    } else if (display === 'Mint') {
      return <LinuxMint className={className} />;
    } else if (display === 'Debian') {
      return <Debian className={className} />;
    } else if (display === 'Windows') {
      return <Windows className={className} />;
    } else if (display === 'Fuchsia') {
      return <Fuchsia className={className} />;
    } else if (display === 'Ubuntu') {
      return <Ubuntu className={className} />;
    } else {
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/os/${display.toLowerCase()}.png`}
          alt={display}
          width={40}
          height={40}
          className={className}
          draggable={false}
        />
      );
    }
  } else if (tab === 'bot') {
    if (display === 'Insomnia Request') {
      return <Insomnia className={className} />;
    } else if (display === 'Twitter Bot') {
      return <Twitter className={`${className} text-twitter`} />;
    } else if (display === 'Discord Bot') {
      return <Discord className={`${className} text-discord`} />;
    } else if (display === 'Yandex Bot') {
      return (
        <BlurImage
          src="https://faisalman.github.io/ua-parser-js/images/browsers/yandex.png"
          alt={display}
          width={40}
          height={40}
          className={className}
          draggable={false}
        />
      );
    } else if (display === 'DuckDuckGo Bot') {
      return <DuckDuckGo className={className} />;
    } else if (display === 'Google Bot') {
      return <Google className={className} />;
    } else if (display === 'Telegram Bot') {
      return <Telegram className={className} />;
    } else if (display === 'Slack Bot') {
      return <Slack className={className} />;
    } else if (display === 'LinkedIn Bot') {
      return <LinkedIn className={className} />;
    } else if (display === 'Baidu Bot') {
      return <Baidu className={`${className} text-blue-700`} />;
    } else if (display === 'Facebook Bot') {
      return <Facebook className={className} />;
    } else if (display === 'Bing Bot') {
      return <Bing className={className} />;
    } else if (display === 'MetaTags Bot') {
      return <MetaTags className={className} />;
    }

    return <img alt={display} src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${display}`} className={className} />;
  } else {
    return (
      <BlurImage
        src="https://faisalman.github.io/ua-parser-js/images/companies/default.png"
        alt={display}
        width={20}
        height={20}
        className={className}
      />
    );
  }
}
