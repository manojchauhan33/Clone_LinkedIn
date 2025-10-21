import Header from '../components/Header'
import Post from '../components/Post';
import  Feed from '../components/Feed/Feed'
const Home = () => {
  return (
    <>
     
      <div className="flex flex-col h-screen">
        <Header />
        <div className="flex-1 overflow-y-auto">
          <Post />
          <Feed />
        </div>
      </div>

    </>
  )
}

export default Home