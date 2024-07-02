import * as child from 'child_process';
import path from 'path';

export const execute = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    child.exec(command, (error: any, stdout: string, stderr: string) => {
      if (!!error || stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
};

type fn = (response?: string) => void;

export const spawnExec = (
  command: string,
  onStdOut: fn,
  onStdErr: fn,
  onStdClose: fn,
): Promise<() => void> => {
  return new Promise((resolve, reject) => {
    const process = child.fork(path.join(__dirname, 'child.js'));
    process.stdout?.on('data', onStdOut);
    process.stderr?.on('data', onStdErr);

    process.send({ command: command, type: 'RUN' });

    process.on('message', (data: any) => {
      switch (data.type) {
        case 'STDOUT':
          onStdOut(data.message.toString());
          break;
        case 'STDERR':
          onStdErr(data.message.toString());
          break;
        default:
          onStdClose();
      }
    });

    const onClose = () => {
      console.log('onclose start', process.pid);
      process.send({ type: 'KILL' });
    };

    resolve(onClose);
  });
};
