import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const Header = styled.header`
  position: relative;
  height: 100px;
  padding-left: 130px;
  margin-bottom: calc(var(--spacing) * 3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  user-select: none;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 110px;
    height: 110px;
    border-radius: 50%;
    background: white url('/logo.png') no-repeat center;
  }

  h1, h6 {
    margin: 0;
  }
`;

const JoinElement = styled.div`
  margin: var(--spacing) auto;
  width: 400px;
`;

const Error = styled.p`
  color: var(--form-element-invalid-border-color);
`;

interface JoinProps {
  onLogin: (name: string) => void;
  defaultName?: string;
  errorMessage?: string;
}

export const Join: React.FC<JoinProps> = ({ onLogin, errorMessage, defaultName }) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);
  return (
    <JoinElement>
      <Header>
        <h1>Compadres</h1>
        <h6>Completing things together</h6>
      </Header>
      <p>Please enter any name</p>
      {errorMessage && <Error>{errorMessage}</Error>}
      <input ref={nameInputRef} type="text" defaultValue={defaultName} />
      <button
        onClick={() => {
          onLogin(nameInputRef.current?.value || "");
        }}
      >
        Join
      </button>
    </JoinElement>
  );
};
