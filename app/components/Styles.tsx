import styled from "styled-components";

export const Settings = styled.div`
  position: absolute;
  top: 20px;
  width: calc(100% - 10px);
  padding-left: 20px;
  padding-right: 20px;
  display: flex;
  z-index: 1000;
`;

export const Child = styled.div`
  flex: 1;
  display: flex;
`;

export const Select = styled.select`
  padding: 5px;
  font-size: 18px;
  box-shadow: 0 0 6px 0 rgba(32, 32, 36, 0.18);
  border: none;
  outline: none;
`;

export const Button = styled.button`
  cursor: pointer;
  background-color: #4681f4;
  color: white;
  padding: 4px 12px;
  border: 50;S
  font-size: 16px;
  font-weight: bold;
  outline: none;
`;

export const IconWrapper = styled.div`
  cursor: pointer;
  margin-left: 10px;
  margin-right: ;
`;
