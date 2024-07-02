import { Button, Input, Td } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { Service } from '../main/service.d';

interface Props {
  serviceName: string;
  port: number;
}

export default function AppItem(props: Props) {
  const [localPort, setLocalPort] = useState(props.port);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const service: Service = {
    serviceName: props.serviceName,
    localPort: localPort,
    containerPort: props.port,
  };

  useEffect(() => {
    const run = async () => {
      if (isConnecting) {
        const status = await window.electron.getConnectStatus(service);
        console.log('status', status);
        switch (status) {
          case 'RUNNING':
            setIsConnected(true);
            setIsConnecting(false);
            return;
          case 'CLOSE':
            setIsConnecting(false);
            return;
        }

        setTimeout(() => {
          run();
        }, 1000);
      }
    };

    run();
  }, [isConnecting]);

  useEffect(() => {
    if (!isConnected) return;

    const interval = async () => {
      const result = await window.electron.getIsConnected(service);
      console.log('interval', result);
      if (!result) {
        console.log('interval setIsConnected');
        setIsConnected(false);
        return;
      }
      setTimeout(() => {
        interval();
      }, 1000);
    };

    console.log('create interval');
    interval();
  }, [isConnected]);

  const forwardPort = async () => {
    try {
      await window.electron.forwardPort(service);
      console.log('isConnecting', true);
      setIsConnecting(true);
    } catch (e) {
      setIsConnecting(false);
      console.log('isConnecting', false);
    }
  };

  const disconnect = async () => {
    await window.electron.disconnect(service);
  };

  return (
    <>
      <Td>{props.port}</Td>
      <Td>:</Td>
      <Td>
        <Input
          w={'100px'}
          defaultValue={localPort}
          type="number"
          min={1}
          max={65535}
          onChange={(e) => setLocalPort(Number(e.target.value))}
          disabled={isConnected}
        />
      </Td>
      <Td>
        {isConnected && (
          <Button onClick={() => disconnect()} colorScheme="red" w={'110px'}>
            Disable
          </Button>
        )}

        {isConnecting && (
          <Button onClick={() => disconnect()} w={'110px'}>
            Connecting...
          </Button>
        )}

        {!isConnected && !isConnecting && (
          <Button onClick={() => forwardPort()} w={'110px'}>
            Connect
          </Button>
        )}
      </Td>
      {<Td w={'20px'}></Td>}
    </>
  );
}
