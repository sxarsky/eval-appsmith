import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Resizer, {
  ResizerCSS,
} from "components/editorComponents/Debugger/Resizer";
import { CodeEditorWithGutterStyles } from "pages/Editor/JSEditor/styledComponents";
import { ViewDisplayMode, ViewHideBehaviour } from "../Interfaces/View";
import { Button } from "@appsmith/ads";
import classNames from "classnames";

const VIEW_MIN_HEIGHT = 38;
const BOTTOM_PANEL_HEIGHT_KEY = "appsmith_bottom_panel_height";

const Container = styled.div<{ displayMode: ViewDisplayMode }>`
  ${ResizerCSS};
  width: 100%;
  background-color: var(--ads-v2-color-bg);
  border-top: 1px solid var(--ads-v2-color-border);
  ${(props) => {
    switch (props.displayMode) {
      case ViewDisplayMode.OVERLAY:
        return `
          position: absolute;
          bottom: 0;
        `;
    }
  }}
`;

const ViewWrapper = styled.div`
  height: 100%;

  &&& {
    ul.ads-v2-tabs__list {
      margin: 0 var(--ads-v2-spaces-8);
      height: ${VIEW_MIN_HEIGHT}px;
    }
  }

  & {
    .ads-v2-tabs__list {
      padding: var(--ads-v2-spaces-1) var(--ads-v2-spaces-7);
      padding-left: var(--ads-v2-spaces-3);
      user-select: none;
    }
  }

  & {
    .ads-v2-tabs__panel {
      ${CodeEditorWithGutterStyles};
      overflow-y: auto;
      height: 100%;
    }
  }
`;

const MIN_HEIGHT = {
  [ViewHideBehaviour.COLLAPSE]: `${VIEW_MIN_HEIGHT}px`,
  [ViewHideBehaviour.CLOSE]: "0px",
};

interface Props {
  className?: string;
  behaviour: ViewHideBehaviour;
  displayMode?: ViewDisplayMode;
  height: number;
  setHeight: (height: number) => void;
  hidden: boolean;
  onHideClick: () => void;
  children: React.ReactNode;
}

const ViewHideButton = styled(Button)`
  &.view-hide-button {
    position: absolute;
    top: 2px;
    right: 0;
    padding: 9px 11px;
  }
`;

interface ViewHideProps {
  hideBehaviour: ViewHideBehaviour;
  isHidden: boolean;
  onToggle: () => void;
}

const ViewHide = (props: ViewHideProps) => {
  const [icon, setIcon] = useState(() => {
    return props.hideBehaviour === ViewHideBehaviour.CLOSE
      ? "close-modal"
      : "arrow-down-s-line";
  });

  useEffect(() => {
    if (props.hideBehaviour === ViewHideBehaviour.COLLAPSE) {
      if (props.isHidden) {
        setIcon("arrow-up-s-line");
      } else {
        setIcon("arrow-down-s-line");
      }
    }
  }, [props.isHidden]);

  return (
    <ViewHideButton
      className="view-hide-button"
      data-testid="t--view-hide-button"
      isIconButton
      kind="tertiary"
      onClick={props.onToggle}
      size="md"
      startIcon={icon}
    />
  );
};

const BottomView = (props: Props) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const { className = "" } = props;
  // Resizer (a child) fires its own initial onResizeComplete on mount, before
  // this component's restore effect below runs (child effects commit before
  // parent effects) -- that call reports whatever the current default height
  // is, and would clobber the persisted value in localStorage before we ever
  // get a chance to read it back. Skip persisting on that first, synthetic
  // call; only persist once the restore effect has run.
  const hasRestoredRef = useRef(false);

  // Restore persisted height from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(BOTTOM_PANEL_HEIGHT_KEY);
    if (saved !== null) {
      const savedHeight = parseInt(saved, 10);
      if (!isNaN(savedHeight) && savedHeight >= VIEW_MIN_HEIGHT + 50) {
        props.setHeight(savedHeight);
      }
    }
    hasRestoredRef.current = true;
  }, []);

  // Handle the height of the view when toggling the hidden state
  useEffect(() => {
    const panel = panelRef.current;

    if (!panel) return;

    if (props.hidden) {
      panel.style.height = MIN_HEIGHT[props.behaviour];
    } else {
      panel.style.height = `${props.height}px`;
    }
  }, [props.hidden, props.behaviour]);

  const handleResizeComplete = (height: number) => {
    if (hasRestoredRef.current) {
      try {
        localStorage.setItem(BOTTOM_PANEL_HEIGHT_KEY, String(height));
      } catch {} // ignore storage errors
    }
    props.setHeight(height);
  };

  const panelSizePct = Math.round((props.height / window.innerHeight) * 100);

  return (
    <Container
      className={classNames("select-text", {
        [className]: true,
        "t--ide-bottom-view": !props.hidden,
      })}
      data-panel-size={panelSizePct}
      displayMode={props.displayMode || ViewDisplayMode.BLOCK}
      ref={panelRef}
    >
      {!props.hidden && (
        <Resizer
          initialHeight={props.height}
          minHeight={VIEW_MIN_HEIGHT + 50}
          onResizeComplete={handleResizeComplete}
          panelRef={panelRef}
        />
      )}
      <ViewWrapper>
        {props.children}
        <ViewHide
          hideBehaviour={props.behaviour}
          isHidden={props.hidden}
          onToggle={props.onHideClick}
        />
      </ViewWrapper>
    </Container>
  );
};

export default BottomView;
