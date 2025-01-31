import {
  $,
  Slot,
  component$,
  useComputed$,
  useContext,
  useSignal,
  useTask$,
  type PropsOf,
  useContextProvider,
} from '@builder.io/qwik';
import { isServer, isBrowser } from '@builder.io/qwik/build';
import SelectContextId, {
  SelectItemContext,
  selectItemContextId,
} from './select-context';
import { useSelect } from './use-select';

export type SelectItemProps = PropsOf<'li'> & {
  /** Internal index we get from the inline component. Please see select-inline.tsx */
  _index?: number;

  /** If true, item is not selectable or focusable. */
  disabled?: boolean;

  /** Selected value associated with the item. */
  value?: string;
};

export const SelectItem = component$<SelectItemProps>((props) => {
  /* look at select-inline on how we get the index. */
  const { _index, disabled, ...rest } = props;
  const context = useContext(SelectContextId);
  const itemRef = useSignal<HTMLLIElement>();
  const localIndexSig = useSignal<number | null>(null);
  const itemId = `${context.localId}-${_index}`;

  const { selectionManager$ } = useSelect();

  const isSelectedSig = useComputed$(() => {
    const index = _index ?? null;
    return !disabled && context.selectedIndexSetSig.value.has(index!);
  });

  const isHighlightedSig = useComputed$(() => {
    return !disabled && context.highlightedIndexSig.value === _index;
  });

  useTask$(function getIndexTask() {
    if (_index === undefined)
      throw Error('Qwik UI: Select component item cannot find its proper index.');

    localIndexSig.value = _index;
  });

  useTask$(function scrollableTask({ track, cleanup }) {
    track(() => context.highlightedIndexSig.value);

    if (isServer) return;

    let observer: IntersectionObserver;

    const checkVisibility = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      // if the is not visible, scroll it into view
      if (isHighlightedSig.value && !entry.isIntersecting) {
        itemRef.value?.scrollIntoView(context.scrollOptions);
      }
    };

    cleanup(() => observer?.disconnect());

    if (isBrowser) {
      observer = new IntersectionObserver(checkVisibility, {
        root: context.listboxRef.value,
        threshold: 1.0,
      });

      if (itemRef.value) {
        observer.observe(itemRef.value);
      }
    }
  });

  const handleClick$ = $(async () => {
    if (disabled || localIndexSig.value === null) return;

    if (context.multiple) {
      await selectionManager$(localIndexSig.value, 'toggle');

      // keep focus so that when pressing escape, the listbox closes even when clicking.
      context.triggerRef.value?.focus();
    } else {
      await selectionManager$(localIndexSig.value, 'add');
      context.isListboxOpenSig.value = false;
    }
  });

  const handlePointerOver$ = $(() => {
    if (disabled) return;

    if (localIndexSig.value !== null) {
      context.highlightedIndexSig.value = localIndexSig.value;
    }
  });

  const selectContext: SelectItemContext = {
    isSelectedSig,
  };

  useContextProvider(selectItemContextId, selectContext);

  return (
    <li
      {...rest}
      id={itemId}
      onClick$={[handleClick$, props.onClick$]}
      onPointerOver$={[handlePointerOver$, props.onPointerOver$]}
      ref={itemRef}
      tabIndex={-1}
      aria-selected={isSelectedSig.value}
      aria-disabled={disabled === true ? 'true' : 'false'}
      data-selected={isSelectedSig.value ? '' : undefined}
      data-highlighted={isHighlightedSig.value ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      data-item
      role="option"
    >
      <Slot />
    </li>
  );
});
