import { $, Slot, component$, sync$, useContext, type PropsOf } from '@builder.io/qwik';
import SelectContextId from './select-context';
import { useSelect, useTypeahead } from './use-select';

type SelectTriggerProps = PropsOf<'button'>;
export const SelectTrigger = component$<SelectTriggerProps>((props) => {
  const context = useContext(SelectContextId);
  const { selectionManager$, getNextEnabledItemIndex$, getPrevEnabledItemIndex$ } =
    useSelect();
  const labelId = `${context.localId}-label`;
  const descriptionId = `${context.localId}-description`;

  const { typeahead$ } = useTypeahead();

  const handleClickSync$ = sync$((e: MouseEvent) => {
    e.preventDefault();
  });

  // Both the space and enter keys run with handleClick$
  const handleClick$ = $(() => {
    context.isListboxOpenSig.value = !context.isListboxOpenSig.value;
  });

  const handleKeyDownSync$ = sync$((e: KeyboardEvent) => {
    const keys = [
      'ArrowUp',
      'ArrowDown',
      'ArrowRight',
      'ArrowLeft',
      'Home',
      'End',
      'PageDown',
      'PageUp',
      'Enter',
      ' ',
    ];
    if (keys.includes(e.key)) {
      e.preventDefault();
    }
  });

  const handleKeyDown$ = $(async (e: KeyboardEvent) => {
    if (!context.itemsMapSig.value) return;

    typeahead$(e.key);

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (context.isListboxOpenSig.value) {
          const action = context.multiple ? 'toggle' : 'add';
          await selectionManager$(context.highlightedIndexSig.value, action);
        }
        context.isListboxOpenSig.value = context.multiple
          ? true
          : !context.isListboxOpenSig.value;
        break;

      case 'ArrowDown':
        if (context.isListboxOpenSig.value) {
          context.highlightedIndexSig.value = await getNextEnabledItemIndex$(
            context.highlightedIndexSig.value!,
          );
          if (context.multiple && e.shiftKey) {
            await selectionManager$(context.highlightedIndexSig.value, 'toggle');
          }
        } else {
          context.isListboxOpenSig.value = true;
        }
        break;

      case 'ArrowUp':
        if (context.isListboxOpenSig.value) {
          context.highlightedIndexSig.value = await getPrevEnabledItemIndex$(
            context.highlightedIndexSig.value!,
          );
          if (context.multiple && e.shiftKey) {
            await selectionManager$(context.highlightedIndexSig.value, 'toggle');
          }
        } else {
          context.isListboxOpenSig.value = true;
        }
        break;

      case 'Home':
        if (context.isListboxOpenSig.value) {
          context.highlightedIndexSig.value = await getNextEnabledItemIndex$(-1);
        }
        break;

      case 'End':
        if (context.isListboxOpenSig.value) {
          const lastEnabledOptionIndex = await getPrevEnabledItemIndex$(
            context.itemsMapSig.value.size,
          );
          context.highlightedIndexSig.value = lastEnabledOptionIndex;
        }
        break;

      case 'Tab':
      case 'Escape':
        context.isListboxOpenSig.value = false;
        break;

      case 'ArrowRight':
        if (!context.multiple) {
          const currentIndex = context.highlightedIndexSig.value ?? -1;
          const nextIndex = await getNextEnabledItemIndex$(currentIndex);
          await selectionManager$(nextIndex, 'add');
          context.highlightedIndexSig.value = nextIndex;
        }
        break;

      case 'ArrowLeft':
        if (!context.multiple) {
          const currentIndex =
            context.highlightedIndexSig.value ?? context.itemsMapSig.value.size;
          const prevIndex = await getPrevEnabledItemIndex$(currentIndex);
          await selectionManager$(prevIndex, 'add');
          context.highlightedIndexSig.value = prevIndex;
        }
        break;

      case 'a':
        if (e.ctrlKey && context.multiple) {
          for (const [index, item] of context.itemsMapSig.value) {
            if (!item.disabled) {
              await selectionManager$(index, 'add');
            }
          }
        }
        break;
    }

    /** When initially opening the listbox, we want to grab the first enabled option index */
    if (context.highlightedIndexSig.value === null) {
      context.highlightedIndexSig.value = await getNextEnabledItemIndex$(-1);
      return;
    }
  });

  return (
    <button
      {...props}
      id={`${context.localId}-trigger`}
      ref={context.triggerRef}
      onClick$={[handleClickSync$, handleClick$, props.onClick$]}
      onKeyDown$={[handleKeyDownSync$, handleKeyDown$, props.onKeyDown$]}
      data-open={context.isListboxOpenSig.value ? '' : undefined}
      data-closed={!context.isListboxOpenSig.value ? '' : undefined}
      data-disabled={context.disabled ? '' : undefined}
      aria-expanded={context.isListboxOpenSig.value}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      disabled={context.disabled}
      preventdefault:blur
    >
      <Slot />
    </button>
  );
});
