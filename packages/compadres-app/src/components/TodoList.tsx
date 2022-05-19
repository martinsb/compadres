import {
  useState,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
  useLayoutEffect,
} from "react";
import styled from "styled-components";
import { Item } from "compadres-common";
import { GarbageIcon } from "./icons/GarbageIcon";

const ListElement = styled.ul`
  padding-left: 0;
`;

const DeleteButton = styled.button`
  color: var(--primary);
  width: 16px;
  height: 16px;
  padding: 0;
  margin: 0 0 0 10px;
  border: 0;
  background: transparent;

  > svg {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const ItemElement = styled.li`
  display: flex;
  align-items: center;

  ${DeleteButton} {
    visibility: hidden;
  }

  &:hover ${DeleteButton} {
    visibility: visible;
  }
`;

const TitleInput = styled.input`
  padding: 0 !important;
  margin-bottom: 0 !important;
  height: auto !important;
  border: none;
  outline: none;

  :focus {
    --box-shadow: none !important;
  }
`;

const CheckboxInput = styled.input`
  flex-grow: 0;
  flex-shrink: 0;
`;

export interface TodoListRef {
  editTitle: (itemId: string) => void;
}

interface TodoListProps {
  items: ReadonlyArray<Item>;
  onItemToggle: (itemId: string) => void;
  onTitleChange: (itemId: string, title: string) => void;
  onAddItem: () => void;
  onRemoveItem: (itemId: string) => void;
}

const List: ForwardRefRenderFunction<TodoListRef, TodoListProps> = (
  { items, onItemToggle, onTitleChange, onAddItem, onRemoveItem },
  ref
) => {
  const [focusedItemId, setFocusedItemId] = useState<string | undefined>(
    undefined
  );
  useImperativeHandle(ref, () => {
    return {
      editTitle: setFocusedItemId,
    };
  });

  const originalValue = useRef<string | undefined>(undefined);
  const focusedInputRef = useRef<HTMLInputElement | null>(null);
  useLayoutEffect(() => {
    if (focusedItemId) {
      focusedInputRef.current?.select();
      originalValue.current = focusedInputRef.current?.value;
    }
  }, [focusedItemId]);

  const handleSpecialKeys = useCallback(
    (id: string, e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        if (!originalValue.current) {
          return;
        }
        e.preventDefault();
        onTitleChange(id, originalValue.current);
      } else if (e.key === "Enter") {
        e.preventDefault();
        setFocusedItemId(undefined);
      } else if (e.key === "Tab") {
        if (!e.shiftKey) {
          const currentIndex = items.findIndex(
            ({ id: itemId }) => itemId === id
          );
          if (currentIndex === items.length - 1) {
            e.preventDefault();
            onAddItem();
          }
        }
      }
    },
    [items, onTitleChange, onAddItem]
  );

  return (
    <ListElement>
      {items.map(({ id, title, done }, index) => {
        const editing = id === focusedItemId;
        const startEditing = () => setFocusedItemId(id);
        return (
          <ItemElement key={id}>
            <CheckboxInput
              type="checkbox"
              checked={done}
              onChange={() => onItemToggle(id)}
            />
            {editing && (
              <TitleInput
                type="text"
                ref={focusedInputRef}
                value={title}
                onChange={(e) => onTitleChange(id, e.target.value)}
                onKeyDown={(e) => handleSpecialKeys(id, e)}
              />
            )}
            {!editing && (
              <>
                <span
                  tabIndex={0}
                  onClick={startEditing}
                  onFocus={startEditing}
                >
                  {title}
                </span>
                <DeleteButton
                  onClick={() => onRemoveItem(id)}
                  data-tooltip="Delete item"
                >
                  <GarbageIcon />
                </DeleteButton>
              </>
            )}
          </ItemElement>
        );
      })}
    </ListElement>
  );
};

export const TodoList = forwardRef(List);
