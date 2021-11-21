import './App.css';
import { useCallback, useEffect, useState, useRef } from 'react';

function App() {
  const [page, setPgae] = useState(1);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatar, setAvatar] = useState("");
  const [fade, setFade] = useState("fadeIn");

  useEffect(()=>{
    let fetchData = ()=>{
      setIsLoading(true);
      
      fetch(`https://api.github.com/gists/public?per_page=${100}&page=${page}`)
        .then((res) =>{
          setIsLoading(false);

          if(res.ok) return res.json();
          throw res;
        })
        .then(resData => {
          setData(d => [...new Set([...d, ...resData])]);
        })
        .catch(err => console.log("fetch data error: ", err))
    };

    fetchData();
  }, [page]);

  const observer = useRef();
  const lastItem = useCallback(node =>{
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPgae(p => p + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading]);

  useEffect(()=>{
    if(fade === 'fadeOut'){
      setFade("fadeIn");
      setAvatar("");
    }
  }, [fade]);

  function onAnimationEnd(){
    if(fade === 'fadeIn'){
      setTimeout(()=>{
        setFade("fadeOut");
      }, 1000);
    }
  }

  return (
    <div className="App">
      {
        data ? 
          data.map((e, i) =>
            <div key={i} className="App-item" ref={i === data.length-1? lastItem: null} 
              onClick={(c)=>{
                c.preventDefault();
                c.stopPropagation();
                if(avatar === "") setAvatar(e.owner.avatar_url);
              }}
            >
              <img className="ItemImage" alt="" src={e.owner.avatar_url}/>
              <p className="ItemText">{e.files[Object.keys(e.files)[0]].filename}</p>
            </div>
          )
          :
          null
      }
      <h1>{isLoading && "Loading More..."}</h1>

      {avatar !== "" && <img className={`ClickAvatar ${fade}`} onAnimationEnd={onAnimationEnd()} alt=" " src={avatar} />}
    </div>
  );
}

export default App;
