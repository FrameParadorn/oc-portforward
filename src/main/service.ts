import { execute } from './execute';

export const getServices = async (event: any) => {
  try {
    const res = await execute('oc get svc');
    return parseServicePorts(res);
  } catch (e) {
    console.error('ERROR', e);
  }

  return [];
};

export interface ServicePort {
  serviceName: string;
  ports: number[];
  isConnected: boolean;
}

function parseServicePorts(data: string): ServicePort[] {
  const lines = data.trim().split('\n');
  const serviceLines = lines.slice(1);

  const servicePorts = serviceLines.map((line) => {
    const columns = line.split(/\s+/);

    const serviceName = columns[0];
    const ports = columns[4]
      .split(',')
      .map((port) => parseInt(port.split('/')[0]));

    return { serviceName, ports, isConnected: false };
  });

  return servicePorts;
}
