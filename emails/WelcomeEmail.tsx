import Head from "./components/Head";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Divider from "./components/Divider";
import {
  Mjml,
  MjmlBody,
  MjmlSection,
  MjmlColumn,
  MjmlText,
  MjmlWrapper,
  MjmlImage,
} from "mjml-react";
import { grayDark } from "./components/theme";

export default function WelcomeEmail({ name }: { name?: string }): JSX.Element {
  return (
    <Mjml>
      <Head />
      <MjmlBody width={500}>
        <MjmlWrapper cssClass="container">
          <Header title="Welcome to Dub" />
          <MjmlSection padding="0">
            <MjmlColumn>
              <MjmlImage
                cssClass="hero"
                padding="0"
                align="left"
                src="https://raw.githubusercontent.com/steven-tey/dub/main/public/static/thumbnail.png"
              />
            </MjmlColumn>
          </MjmlSection>
          <MjmlSection cssClass="smooth">
            <MjmlColumn>
              <MjmlText cssClass="paragraph">
                Thanks for signing up{name && `, ${name}`}!
              </MjmlText>
              <MjmlText cssClass="paragraph">
                My name is Steven, and I'm the creator of Dub - the open-source
                Bitly alternative. I'm excited to have you on board!
              </MjmlText>
              <MjmlText cssClass="paragraph">
                Here's a few things you can do:
              </MjmlText>
              <MjmlText cssClass="li">
                •&nbsp;&nbsp;Create a custom{" "}
                <a href="https://app.dub.sh/links" target="_blank">
                  Dub.sh short link
                </a>
              </MjmlText>
              <MjmlText cssClass="li">
                •&nbsp;&nbsp;Create a new{" "}
                <a href="https://app.dub.sh/" target="_blank">
                  project
                </a>{" "}
                and add your custom domain
              </MjmlText>
              <MjmlText cssClass="li">
                •&nbsp;&nbsp;Star the repo on{" "}
                <a href="https://github.com/steven-tey/dub" target="_blank">
                  GitHub
                </a>
              </MjmlText>
              <MjmlText cssClass="li">
                •&nbsp;&nbsp;Follow us on{" "}
                <a href="https://twitter.com/dubdotsh/" target="_blank">
                  Twitter
                </a>
              </MjmlText>
              <MjmlText cssClass="paragraph">
                Let me know if you have any questions or feedback. I'm always
                happy to help!
              </MjmlText>
              <MjmlText cssClass="paragraph" color={grayDark}>
                P.S.: You'll receive an email from Trustpilot in the next couple
                of days - if you enjoyed using Dub, it would mean a lot if you
                could leave a review; if not, I'd love to hear what I can do to
                improve Dub!
              </MjmlText>
              <MjmlText cssClass="paragraph" color={grayDark}>
                Steven from Dub
              </MjmlText>
              <Divider />
            </MjmlColumn>
          </MjmlSection>
          <Footer unsubscribe />
        </MjmlWrapper>
      </MjmlBody>
    </Mjml>
  );
}