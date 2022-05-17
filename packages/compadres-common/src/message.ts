export interface Item {
  id: string;
  title: string;
  done: boolean;
}

export interface Project {
  name: string;
  items: Item[];
}

export type TodoError = {
  code: "name-taken";
  name: string;
};

export type TodoMessage =
  | {
      type: "join";
      payload: {
        name: string;
      };
    }
  | {
      type: "project-list";
      payload: string[];
    }
  | {
      type: "error";
      payload: TodoError;
    }
  | {
      type: "open-project";
      payload: string; //project name
    }
  | {
      type: "close-project";
      payload: string; //project name
    }
  | {
      type: "project-data";
      payload: {
        name: string;
        data: number[];
      };
    }
  | {
      type: "project-changes";
      payload: {
        name: string;
        changes: number[][];
      };
    };
