import { Dispatch, SetStateAction, useCallback, useMemo, useRef, useState } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import toast from 'react-hot-toast';

import BlurImage from '@/components/shared/blur-image';
import IconMenu from '@/components/shared/icon-menu';
import { ChevronRight, Clipboard, Download, Logo, Photo } from '@/components/shared/icons';
import Modal from '@/components/shared/modal';
import Popover from '@/components/shared/popover';
import Switch from '@/components/shared/switch';
import Tooltip from '@/components/shared/tooltip';
import { getQRAsCanvas, getQRAsSVGDataUri, QRCodeSVG } from '@/lib/qr';
import useProject from '@/lib/swr/use-project';
import { SimpleLinkProps } from '@/lib/types';
import { getApexDomain, getFaviconFromDomain, linkConstructor } from '@/lib/utils';

function LinkQRModalHelper({
  showLinkQRModal,
  setShowLinkQRModal,
  props
}: {
  showLinkQRModal: boolean;
  setShowLinkQRModal: Dispatch<SetStateAction<boolean>>;
  props: SimpleLinkProps;
}) {
  const anchorRef = useRef<HTMLAnchorElement>();
  const [showLogo, setShowLogo] = useState(true);
  const { project: { domain } = {} } = useProject();
  const { avatarUrl, apexDomain } = useMemo(() => {
    try {
      const apexDomain = getApexDomain(props.url);
      return { avatarUrl: getFaviconFromDomain(apexDomain), apexDomain };
    } catch (e) {
      return null;
    }
  }, [props]);
  const qrDestUrl = useMemo(() => linkConstructor({ key: props.key, domain }), [props, domain]);
  const qrLogoUrl = useMemo(
    () => (typeof window !== 'undefined' && window.location.origin ? new URL('/static/logo.svg', window.location.origin).href : ''),
    []
  );
  const [qrData, setQrData] = useState({
    value: qrDestUrl,
    bgColor: '#ffffff',
    fgColor: '#000000',
    size: 1024,
    level: 'Q', // QR Code error correction level: https://blog.qrstuff.com/general/qr-code-error-correction
    ...(showLogo && {
      imageSettings: {
        src: qrLogoUrl,
        height: 256,
        width: 256,
        excavate: true
      }
    })
  });

  const copyToClipboard = async () => {
    const canvas = await getQRAsCanvas(qrData, 'image/png', true);
    (canvas as HTMLCanvasElement).toBlob(async function (blob) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
    });
  };

  function download(url: string, extension: string) {
    if (!anchorRef.current) return;
    anchorRef.current.href = url;
    anchorRef.current.download = `${props.key}-qrcode.${extension}`;
    anchorRef.current.click();
  }

  return (
    <Modal showModal={showLinkQRModal} setShowModal={setShowLinkQRModal}>
      <div className="inline-block w-full sm:max-w-md align-middle transition-all transform bg-white sm:border sm:border-gray-200 shadow-xl sm:rounded-2xl">
        <div className="flex flex-col justify-center items-center space-y-3 sm:px-16 px-4 pt-8 py-4 border-b border-gray-200">
          {avatarUrl ? (
            <BlurImage src={avatarUrl} alt={apexDomain} className="w-10 h-10 rounded-full" width={40} height={40} />
          ) : (
            <Logo className="w-10 h-10" />
          )}
          <h3 className="font-medium text-lg">Download QR Code</h3>
        </div>

        <div className="flex flex-col space-y-6 text-left bg-gray-50 py-6 sm:rounded-b-2xl">
          <div className="p-4 rounded-lg bg-white mx-auto border-2 border-gray-200">
            <QRCodeSVG
              value={qrData.value}
              size={qrData.size / 8}
              bgColor={qrData.bgColor}
              fgColor={qrData.fgColor}
              level={qrData.level}
              includeMargin={false}
              imageSettings={
                showLogo && {
                  ...qrData.imageSettings,
                  height: qrData.imageSettings.height / 8,
                  width: qrData.imageSettings.width / 8
                }
              }
            />
          </div>

          <AdvancedSettings qrData={qrData} setQrData={setQrData} setShowLogo={setShowLogo} />

          <div className="grid grid-cols-2 gap-2 px-4 sm:px-16">
            <button
              onClick={async () => {
                toast.promise(copyToClipboard(), {
                  loading: 'Copying...',
                  success: 'Copied!',
                  error: 'Failed to copy'
                });
              }}
              className="flex items-center justify-center gap-2 rounded-md border border-black bg-black py-1.5 px-5 text-sm text-white transition-all hover:bg-white hover:text-black"
            >
              <Clipboard className="h-4 w-4" /> Copy
            </button>
            <QrDropdown download={download} qrData={qrData} qrDestUrl={qrDestUrl} />
          </div>

          {/* This will be used to prompt downloads. */}
          <a className="hidden" download={`${props.key}-qrcode.svg`} ref={anchorRef} />
        </div>
      </div>
    </Modal>
  );
}

function AdvancedSettings({ qrData, setQrData, setShowLogo }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="sm:px-16 px-4">
        <button type="button" className="flex items-center" onClick={() => setExpanded(!expanded)}>
          <ChevronRight className={`h-5 w-5 text-gray-600 ${expanded ? 'rotate-90' : ''} transition-all`} />
          <p className="text-gray-600 text-sm">Advanced options</p>
        </button>
      </div>
      {expanded && (
        <div className="mt-4 grid gap-5 bg-white border-t border-b border-gray-200 sm:px-16 px-4 py-8">
          <div>
            <label htmlFor="logo-toggle" className="block text-sm font-medium text-gray-700">
              Logo
            </label>
            <div className="flex mt-1 space-x-2 items-center">
              <Switch trackDimensions="h-6 w-12" thumbDimensions="w-5 h-5" thumbTranslate="translate-x-6" fn={setShowLogo} />
              <p className="text-gray-600 text-sm">Show Logo</p>
            </div>
          </div>
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700">
              Foreground Color
            </label>
            <div className="relative flex mt-1 rounded-md shadow-sm h-9 w-48">
              <Tooltip
                content={
                  <div className="max-w-xs flex flex-col text-center items-center space-y-3 p-5">
                    <HexColorPicker
                      color={qrData.fgColor}
                      onChange={(color) =>
                        setQrData({
                          ...qrData,
                          fgColor: color
                        })
                      }
                    />
                  </div>
                }
              >
                <div
                  className="rounded-l-md w-12 h-full border"
                  style={{
                    backgroundColor: qrData.fgColor,
                    borderColor: qrData.fgColor
                  }}
                />
              </Tooltip>
              <HexColorInput
                id="color"
                name="color"
                color={qrData.fgColor}
                onChange={(color) =>
                  setQrData({
                    ...qrData,
                    fgColor: color
                  })
                }
                prefixed
                style={{ borderColor: qrData.fgColor }}
                className={`border-2 border-l-0 text-gray-900 placeholder-gray-300 focus:ring-black pl-3 block w-full rounded-r-md focus:outline-none sm:text-sm`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QrDropdown({ download, qrData, qrDestUrl }) {
  const [openPopover, setOpenPopover] = useState(false);
  return (
    <>
      <Popover
        content={
          <div className="grid w-full gap-1 p-2 sm:w-40">
            <button
              onClick={() => download(getQRAsSVGDataUri({ value: qrDestUrl, ...qrData }), 'svg')}
              className="w-full rounded-md p-2 text-left text-sm font-medium text-gray-500 transition-all duration-75 hover:bg-gray-100"
            >
              <IconMenu text="SVG" icon={<Photo className="h-4 w-4" />} />
            </button>
            <button
              onClick={async () => {
                download(await getQRAsCanvas({ value: qrDestUrl, ...qrData }, 'image/png'), 'png');
              }}
              className="w-full rounded-md p-2 text-left text-sm font-medium text-gray-500 transition-all duration-75 hover:bg-gray-100"
            >
              <IconMenu text="PNG" icon={<Photo className="h-4 w-4" />} />
            </button>
            <button
              onClick={async () => {
                download(await getQRAsCanvas({ value: qrDestUrl, ...qrData }, 'image/jpeg'), 'jpg');
              }}
              className="w-full rounded-md p-2 text-left text-sm font-medium text-gray-500 transition-all duration-75 hover:bg-gray-100"
            >
              <IconMenu text="JPEG" icon={<Photo className="h-4 w-4" />} />
            </button>
          </div>
        }
        align="center"
        openPopover={openPopover}
        setOpenPopover={setOpenPopover}
      >
        <button
          onClick={() => setOpenPopover(!openPopover)}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-black bg-black py-1.5 px-5 text-sm text-white transition-all hover:bg-white hover:text-black"
        >
          <Download />
          Export
        </button>
      </Popover>
    </>
  );
}

export function useLinkQRModal({ props }: { props: SimpleLinkProps }) {
  const [showLinkQRModal, setShowLinkQRModal] = useState(false);

  const LinkQRModal = useCallback(() => {
    return <LinkQRModalHelper showLinkQRModal={showLinkQRModal} setShowLinkQRModal={setShowLinkQRModal} props={props} />;
  }, [showLinkQRModal, setShowLinkQRModal, props]);

  return useMemo(() => ({ setShowLinkQRModal, LinkQRModal }), [setShowLinkQRModal, LinkQRModal]);
}
