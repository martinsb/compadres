import React, { useEffect, useRef } from "react";
import styled from "styled-components";

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
