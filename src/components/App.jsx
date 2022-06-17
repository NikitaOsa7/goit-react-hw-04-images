import Button from "./Button/Button";
import Searchbar from "./Searchbar/Searchbar";
import Loader from "./Loader/Loader";
import ImageGallery from "./ImageGallery/ImageGallery";
import Modal from "./Modal/Modal";
import s from '../components/App.module.css';
import { useEffect, useState } from "react";
import fetchImagesByQuery from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    const [searchData, setSearchData] = useState('');
    const [images, setImages] = useState([]);
    const [page, setPage] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [largeImage, setLargeImage] = useState('');

    useEffect(() => {
        if (!page) {
            return;
        }

        try {
            setIsLoading(true)
            const response = fetchImagesByQuery(searchData, page);
            response.then(data => {
                data.data.hits.length === 0
                    ? toast.error('No hits')
                    : data.data.hits.forEach(({ id, webformatURL, largeImageURL }) => {
                        !images.some(image => image.id === id) &&
                            setImages(...i => [...i, { id, webformatURL, largeImageURL }]);
                    });
                setIsLoading(false)
            });
        } catch (error) {
            setError(error);
            setIsLoading(false);
        }
    }, [images, page, searchData]);

    const onSumbit = newSearchData => {
        if (searchData.trim() === '') {
            return toast.error('Enter the image request');
        } else if (newSearchData === searchData) {
            return;
        }
        setImages([]);
        setPage(1);
        setSearchData(newSearchData);
    };

    const nextPage = () => {
        setPage(p => p + 1);
    } 

    const openModal = index => {
        setShowModal(true)
        setLargeImage(images[index].largeImageURL);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <div className={s.App}>
            <Searchbar onSubmit={onSumbit} />
            {images.length !== 0 && (
                <ImageGallery images={images} openModal={openModal} />
            )}
            {showModal && (
                <Modal toggleModal={toggleModal} largeImage={largeImage} />
            )}
            {isLoading && <Loader />}
            <ToastContainer autoClose={2500} />
            {images.length >= 12 && <Button nextPage={nextPage} />}
        </div>
    );
};

