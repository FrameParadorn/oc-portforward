import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardBody,
  Container,
  HStack,
  Table,
  TableContainer,
  Tbody,
  Text,
  Tr,
} from '@chakra-ui/react';
import { ServicePort } from '../main/service';
import AppItem from './AppItem';
var _ = require('lodash');

function Home() {
  const [services, setServices] = useState<ServicePort[]>([]);

  useEffect(() => {
    async function run() {
      let services = await window.electron.getServices();
      setServices(services);
    }
    run();
  }, []);

  return (
    <Container maxW="90vw" mt={'2rem'}>
      {services.map((d, di) => {
        return (
          <Card mb={'10px'} key={di}>
            <CardBody>
              <HStack>
                <Box w={'50%'}>
                  <Text>{d.serviceName}</Text>
                </Box>
                <HStack w={'50%'} overflowX={'scroll'} gap={'0px'}>
                  {d.ports.map((p, pi) => (
                    <AppItem serviceName={d.serviceName} port={p} key={pi} />
                  ))}
                </HStack>
              </HStack>
            </CardBody>
          </Card>
        );
      })}
    </Container>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
