import styled from 'styled-components';

const StyledButton = styled.button`
  background-color: #0d6efd;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #0b5ed7;
  }
`;

const Button = ({ onClick }) => {
  return <StyledButton onClick={onClick}>Docs</StyledButton>;
};

export default Button;
