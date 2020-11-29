import React from 'react';

import { Container, Button } from 'reactstrap';

import './PrivacyPolicy.scss';
import { useHistory } from 'react-router-dom';

const PrivacyPolicy = () => {
  const history = useHistory();

  const handleLogin = () => {
    history.push('/');
  };
  return (
    <div className="app flex-row align-items-center background">
      <Container className="policyWrapper">
        <h2>POLÍTICA DE PRIVACIDADE</h2>
        <p>
          A presente Política de Privacidade contém informações sobre coleta,
          uso, armazenamento, tratamento e proteção dos dados pessoais dos
          usuários e visitantes do aplicativo S.O.S PET, com a finalidade de
          demonstrar absoluta transparência quanto ao assunto e esclarecer a
          todos interessados sobre os tipos de dados que são coletados, os
          motivos da coleta e a forma como os usuários podem gerenciar ou
          excluir as suas informações pessoais.
        </p>
        <p>
          Esta Política de Privacidade aplica-se a todos os usuários e
          visitantes do aplicativo S.O.S PET e integra os Termos e Condições
          Gerais de Uso do aplicativo S.O.S PET, devidamente inscrita no CNPJ
          sob o nº 43.418.229/0001-53, situado em Goiânia, Goias, doravante
          nominada S.O.S PET.
        </p>
        <p>
          O presente documento foi elaborado em conformidade com a Lei Geral de
          Proteção de Dados Pessoais (Lei{' '}
          <a
            href="https://www.jusbrasil.com.br/legislacao/612902269/lei-13709-18"
            rel="200399658"
            title="LEI Nº 13.709, DE 14 DE AGOSTO DE 2018."
          >
            13.709
          </a>
          /18), o{' '}
          <a
            href="https://www.jusbrasil.com.br/legislacao/117197216/lei-12965-14"
            rel="27363947"
            title="LEI Nº 12.965, DE 23 ABRIL DE 2014."
          >
            Marco Civil da Internet
          </a>{' '}
          (Lei{' '}
          <a
            href="https://www.jusbrasil.com.br/legislacao/117197216/lei-12965-14"
            rel="27363947"
            title="LEI Nº 12.965, DE 23 ABRIL DE 2014."
          >
            12.965
          </a>
          /14) (e o Regulamento da UE n. 2016/6790). Ainda, o documento poderá
          ser atualizado em decorrência de eventual atualização normativa, razão
          pela qual se convida o usuário a consultar periodicamente esta seção.
        </p>
        <Button
          onClick={handleLogin}
          color="primary"
          className="px-4 w-100 text-white font-weight-bold text-uppercase"
          type="submit"
        >
          Login
        </Button>
      </Container>
    </div>
  );
};

export default PrivacyPolicy;
