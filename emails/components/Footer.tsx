import { MjmlColumn, MjmlSection, MjmlText } from 'mjml-react';

export default function Footer(): JSX.Element {
  return (
    <MjmlSection cssClass="smooth">
      <MjmlColumn>
        <MjmlText cssClass="footer">Stub instance hosted from {process.env.APP_HOSTNAME}</MjmlText>
      </MjmlColumn>
    </MjmlSection>
  );
}
