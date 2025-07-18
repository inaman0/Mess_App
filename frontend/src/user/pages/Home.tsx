import Menu from "./Menu";
import MenuOfTime from "./MenuOfTime";

const Home = () => {
  return (
    <>
      <h1 className="title">Home</h1>
      <div className="uploader-wrapper">
        <MenuOfTime />
      </div>
    </>
  );
};

export default Home;
