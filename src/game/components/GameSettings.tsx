import styled from 'styled-components';
import { Dialog } from '../../common';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useState } from 'react';
import {
  BoardSettings,
  ClimaxSettings,
  DurationSettings,
  EventSettings,
  HypnoSettings,
  ImageSettings,
  PaceSettings,
  PlayerSettings,
} from '../../settings';
import { GamePhase, useGameValue, useSendMessage } from '../GameProvider';
import { useLooping } from '../../utils';

const StyledGameSettings = styled.div``;

const StyledGameSettingsButton = styled.button`
  display: flex;
  height: fit-content;

  align-items: center;
  justify-content: center;

  border-radius: 0 var(--border-radius) 0 0;
  background: var(--overlay-color);
  color: #fff;

  padding: 12px;

  font-size: var(--icon-size);

  cursor: pointer;

  &:hover {
    filter: brightness(1.2);
  }
`;

interface GameSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StyledGameSettingsDialog = styled.div`
  overflow: auto;
  max-width: 920px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 400px), 1fr));
`;

const GameSettingsDialog: React.FC<GameSettingsDialogProps> = props => {
  return (
    <Dialog
      dismissable
      {...props}
      title={'Game Settings'}
      content={
        <StyledGameSettingsDialog>
          <PaceSettings />
          <DurationSettings />
          <PlayerSettings />
          <EventSettings />
          <HypnoSettings />
          <ClimaxSettings />
          <BoardSettings />
          <ImageSettings />
        </StyledGameSettingsDialog>
      }
    />
  );
};

export const GameSettings = () => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useGameValue('phase');
  const [timer, setTimer] = useState<number | undefined>(undefined);
  const sendMessage = useSendMessage();
  const messageId = 'game-settings';

  const onOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setTimer(undefined);
        setPhase(phase => {
          if (phase === GamePhase.active) {
            return GamePhase.pause;
          }
          return phase;
        });
      } else {
        setTimer(3000);
      }
      setOpen(open);
    },
    [setPhase]
  );

  useLooping(
    () => {
      if (timer === undefined) return;
      if (timer > 0) {
        sendMessage({
          id: messageId,
          title: 'Get ready to continue.',
          description: `${timer * 0.001}...`,
        });
        setTimer(timer - 1000);
      } else if (timer === 0) {
        sendMessage({
          id: messageId,
          title: 'Continue.',
          description: undefined,
          duration: 1500,
        });
        setPhase(GamePhase.active);
        setTimer(undefined);
      }
    },
    1000,
    !open && phase === GamePhase.pause && timer !== undefined
  );

  return (
    <StyledGameSettings>
      <StyledGameSettingsButton onClick={() => onOpen(true)}>
        <FontAwesomeIcon icon={faCog} />
      </StyledGameSettingsButton>
      <GameSettingsDialog open={open} onOpenChange={onOpen} />
    </StyledGameSettings>
  );
};
