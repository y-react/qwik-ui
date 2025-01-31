import { component$, useStyles$, useSignal, $ } from '@builder.io/qwik';
import { Collapsible } from '@qwik-ui/headless';
import styles from '../snippets/collapsible.css?inline';
import SVG from './svg';

export default component$(() => {
  useStyles$(styles);
  const count = useSignal<number>(0);
  const isOpen = useSignal<boolean>(false);

  const handleOpenChange$ = $((open: boolean) => {
    isOpen.value = open;
    count.value++;
  });

  return (
    <>
      <p>
        count: <strong> {count.value}</strong>
      </p>

      <Collapsible.Root class="collapsible" onOpenChange$={handleOpenChange$}>
        <Collapsible.Trigger class="collapsible-trigger">
          <span>Trigger</span>
          <SVG />
        </Collapsible.Trigger>
        <Collapsible.Content class="collapsible-content collapsible-content-outline ">
          Content
        </Collapsible.Content>
      </Collapsible.Root>
    </>
  );
});
