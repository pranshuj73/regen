import styled from 'styled-components';

const StyledButton = styled.button`
    background: none;
    border: 1px solid var(--accent);
    color: var(--accent);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    transition: background-color 0.3s ease;

    &:hover {
        background-color: var(--accent);
        color: var(--foreground);
    }
`;

export default StyledButton;
