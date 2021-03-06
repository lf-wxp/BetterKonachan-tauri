import React, { useEffect } from 'react';
import { useAsync } from 'react-use';
import { useRecoilState } from 'recoil';

import {
	imagesState,
	totalState,
	loadingState,
	tagsState,
	pageState,
	refreshToggleState,
  downloadItemsState,
} from '../../store';
import { DownloadItem } from '../../model/downloadItem';
import { getPost, listenProgress, ProgressAction, updateProgress } from '../../utils/action';

export default React.memo(() => {
	const [, setImages] = useRecoilState(imagesState);
	const [, setTotal] = useRecoilState(totalState);
	const [, setLoading] = useRecoilState(loadingState);
	const [, setDownloadItems] = useRecoilState(downloadItemsState);
	const [tags] = useRecoilState(tagsState);
	const [page] = useRecoilState(pageState);
	const [refresh] = useRecoilState(refreshToggleState);

	useAsync(async () => {
		setLoading(true);
    const data = await getPost({ page, tags, refresh });
    setLoading(false);
    if (!data) return;
    setImages(data.images);
    setTotal(data.count);
	}, [refresh, tags, page]);

  useEffect(() => {
    listenProgress((data: DownloadItem) => {
      setDownloadItems(prev => updateProgress(prev, ProgressAction.UPDATE, data));
    });
  }, []);
	return null;
});
