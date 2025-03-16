import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 1rem 0;
  margin-top: 2rem;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Copyright = styled.p`
  font-size: 0.9rem;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const FooterLink = styled.a`
  color: #ecf0f1;
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    text-decoration: underline;
  }
`;

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent className="container">
        <Copyright>&copy; {currentYear} 博客主题监控服务</Copyright>
        <FooterLinks>
          <FooterLink href="https://www.arcblock.io" target="_blank" rel="noopener noreferrer">
            ArcBlock
          </FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
}

export default Footer;
