// pages/index.tsx
import { NextPage } from 'next';
import TipTapEditor from './components/TextEditor';

const Home: NextPage = () => {
  return (
    <div className="page-container">
      <h1>Space-Themed Text Editor</h1>
      <TipTapEditor />
    </div>
  );
};

export default Home;
