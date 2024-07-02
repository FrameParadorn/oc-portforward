import { container } from 'webpack';
import { execute, spawnExec } from './execute';
import { Service } from './service.d';
import { ProcessState } from './pod.d';

const processState: ProcessState = {};

export const forwardPort = async (event: any, service: Service) => {
  console.log('start forawrd', service);
  try {
    const pods = await getPodsByServiceName(service);
    const randomNumber = Math.floor(Math.random() * pods.length);
    const command = `oc port-forward pod/${pods[randomNumber]} ${service.localPort}:${service.containerPort}`;

    const handleOnOut = (response?: string) => {
      addLogProcess(service, response!);
    };

    const handleOnError = (error?: string) => {
      addLogProcess(service, error!);
      closeProcess(service);
      console.log(error);
    };

    const handleOnClose = () => {
      closeProcess(service);
    };

    createProcess(service);

    const onClose = await spawnExec(
      command,
      handleOnOut,
      handleOnError,
      handleOnClose,
    );

    startProcess(service, onClose);
  } catch (e) {
    console.error('ERROR', e);
  }
};

export const getIsConnected = (event: any, service: Service) => {
  const stateName = getStateName(service);
  return processState[stateName]?.status === 'RUNNING';
};

export const getConnectStatus = (event: any, service: Service) => {
  const stateName = getStateName(service);
  return processState[stateName]?.status;
};

export const disconnect = async (event: any, service: Service) => {
  const stateName = getStateName(service);
  processState[stateName].onClose();
};

const getStateName = (service: Service) => {
  return `${service.serviceName}_${service.containerPort}`;
};

const createProcess = (service: Service) => {
  const stateName = getStateName(service);
  processState[stateName] = {
    status: 'CREATING',
    service: service,
    onClose: () => {},
    log: [],
  };
  console.log(processState);
};

const startProcess = (service: Service, onClose: () => void) => {
  const stateName = getStateName(service);
  processState[stateName] = {
    status: 'RUNNING',
    service: service,
    onClose: onClose,
    log: [],
  };
  console.log(processState);
};

const closeProcess = (service: Service) => {
  const stateName = getStateName(service);
  processState[stateName].status = 'CLOSE';
  console.log(processState);
};

const addLogProcess = (service: Service, data: string) => {
  const stateName = getStateName(service);
  processState[stateName].log.push(data);
};

const getPodsByServiceName = async (service: Service): Promise<string[]> => {
  try {
    const response = await execute('oc get pods');
    const pods = parsePodNames(response);
    const results = pods.filter((p) => p.includes(service.serviceName));
    return results;
  } catch (e) {
    console.error('ERROR', e);
  }
  return [];
};

function parsePodNames(data: string): string[] {
  let lines = data.trim().split('\n');
  lines.shift();

  const podNames = lines.map((line) => {
    return line.split(/\s+/)[0];
  });

  return podNames;
}
