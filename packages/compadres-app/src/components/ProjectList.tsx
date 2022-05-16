interface ProjectListProps {
  projects: { name: string; selected: boolean }[];
  onSelectionChange: (projectName: string, selected: boolean) => void;
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onSelectionChange,
}: ProjectListProps) => {
  return (
    <menu>
      {projects.map(({ name, selected }) => (
        <li key={name}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectionChange(name, e.target.checked)}
          />
          {name}
        </li>
      ))}
    </menu>
  );
};
