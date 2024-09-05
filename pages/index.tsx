// pages/index.tsx
import { NextPage } from 'next';
import TextEditor from './components/TextEditor';

const Home: NextPage = () => {
  return (
    <div>
      <h1>Space-Themed Text Editor</h1>
      <TextEditor />
      <a href="/saved-content.txt" download>Download Saved Content</a>
    </div>
  );
};

export default Home;
