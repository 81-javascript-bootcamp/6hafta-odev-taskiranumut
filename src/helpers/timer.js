import { getRemainingDate } from './date';

export const creatTimer = ({
  context,
  intervalVariable,
  intervalEnd = 1000,
  deadline,
  $timerEl = '$timerEl',
  timerElContent,
  currentRemaining,
  onStop,
}) => {
  context[intervalVariable] = setInterval(() => {
    const remainingTime = getRemainingDate(deadline);
    const { total, minutes, seconds } = remainingTime;
    if (context[currentRemaining]) {
      context[currentRemaining] = total;
    }
    context[$timerEl].innerHTML = `${timerElContent}${minutes}:${seconds}`;
    if (total <= 0) {
      onStop();
    }
  }, intervalEnd);
};
