import { Apple, Baidu, Bing, Chrome, DuckDuckGo, Google, Insomnia, LinkedIn, Safari, Slack, Telegram } from 'components/shared/icons/devices';

import BlurImage from '@/components/shared/blur-image';
import { DeviceTabs } from '@/lib/stats';

import { Discord, Facebook, Twitter } from '../shared/icons';

export default function DeviceIcon({ display, tab, className }: { display: string; tab: DeviceTabs; className: string }) {
  if (display === 'Bot') {
    return <img alt={display} src="https://avatars.dicebear.com/api/bottts/dub.svg" className={className} />;
  }
  if (tab === 'device') {
    return (
      <BlurImage
        src={
          display === 'Desktop'
            ? `https://faisalman.github.io/ua-parser-js/images/types/default.png`
            : `https://faisalman.github.io/ua-parser-js/images/types/${display}.png`
        }
        alt={display}
        width={20}
        height={20}
        sizes="10vw"
        className={className}
      />
    );
  } else if (tab === 'browser') {
    if (display === 'Chrome') {
      return <Chrome className={className} />;
    } else if (display === 'Safari' || display === 'Mobile Safari') {
      return <Safari className={className} />;
    } else {
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/browsers/${display.toLowerCase()}.png`}
          alt={display}
          width={20}
          height={20}
          className={className}
        />
      );
    }
  } else if (tab === 'os') {
    if (display === 'Mac OS') {
      return <BlurImage src="/static/icons/macos.png" alt={display} width={20} height={20} className={className} />;
    } else if (display === 'iOS') {
      return <Apple className={className} />;
    } else {
      return (
        <BlurImage
          src={`https://faisalman.github.io/ua-parser-js/images/os/${display.toLowerCase()}.png`}
          alt={display}
          width={20}
          height={20}
          className={className}
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
          width={20}
          height={20}
          className={className}
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
    }

    return <img alt={display} src={`https://avatars.dicebear.com/api/bottts/${display}.svg`} className={className} />;
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
