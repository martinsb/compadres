import React from "react";
import styled from "styled-components";
interface ProjectListProps {
  projects: { name: string; selected: boolean }[];
  onSelectionChange: (projectName: string, selected: boolean) => void;
}

const Menu = styled.menu`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const Item = styled.label`
  cursor: pointer;
`;

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectionChange,
}: ProjectListProps) => {
  return (
    <Menu>
      {projects.map(({ name, selected }) => (
        <li key={name}>
          <Item>
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelectionChange(name, e.target.checked)}
            />
            {name}
          </Item>
        </li>
      ))}
    </Menu>
  );
};
