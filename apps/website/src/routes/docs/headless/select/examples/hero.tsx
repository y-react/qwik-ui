import { component$, useStyles$ } from '@builder.io/qwik';
import { Select } from '@qwik-ui/headless';

export default component$(() => {
  useStyles$(styles);
  const users = ['Tim', 'Ryan', 'Jim', 'Jessie', 'Abby'];

  return (
    <Select.Root class="select">
      <Select.Label>Logged in users</Select.Label>
      <Select.Trigger class="select-trigger">
        <Select.DisplayText placeholder="Select an option" />
      </Select.Trigger>
      <Select.Popover class="select-popover">
        <Select.Listbox class="select-listbox">
          {users.map((user) => (
            <Select.Item key={user}>
              <Select.ItemLabel>{user}</Select.ItemLabel>
            </Select.Item>
          ))}
        </Select.Listbox>
      </Select.Popover>
    </Select.Root>
  );
});

// internal
import styles from '../snippets/select.css?inline';
