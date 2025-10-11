'use client'
import { getDiscussion } from '@/api'
import { GetDiscussionParams, ModelDiscussion, ModelGroupItemInfo, ModelGroupWithItem, ModelListRes } from '@/api/types'
import { Card, CusTabs } from '@/components'
import { AuthContext } from '@/components/authProvider'
import { CommonContext } from '@/components/commonProvider'
import { ReleaseModal } from '@/components/discussion'
import { useAuthCheck } from '@/hooks/useAuthCheck'
import SearchIcon from '@mui/icons-material/Search'
import { Box, Button, Divider, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material'
import { useBoolean } from 'ahooks'
import { redirect, useRouter, useSearchParams } from 'next/navigation'
import React, { useContext, useEffect, useRef, useState } from 'react'
import DiscussCard, { DiscussCardMobile } from './discussCard'

export type Status = 'hot' | 'new' | 'mine'

const Article = ({
  data,
  topics,
  groups: groupsData,
}: {
  data: ModelListRes & {
    items?: ModelDiscussion[]
  }
  topics: number[]
  groups?: ModelListRes & {
    items?: (ModelGroupWithItem & {
      items?: ModelGroupItemInfo[]
    })[]
  }
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useContext(AuthContext)
  const { checkAuth } = useAuthCheck()
  const { groups: contextGroups, groupsLoading } = useContext(CommonContext)

  // 优先使用SSR传入的groups数据，否则使用Context中的数据
  const groups = groupsData
    ? {
        origin: groupsData.items ?? [],
        flat: (groupsData.items?.filter((i) => !!i.items) || []).reduce((acc, item) => {
          acc.push(...(item.items || []))
          return acc
        }, [] as ModelGroupItemInfo[]),
      }
    : contextGroups

  const [releaseModalVisible, { setTrue: releaseModalOpen, setFalse: releaseModalClose }] = useBoolean(false)
  const [status, setStatus] = useState<Status | 'search_key'>((searchParams.get('sort') as Status) || 'hot')
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const searchRef = useRef(search)
  const [articleData, setArticleData] = useState(data)
  const [page, setPage] = useState(1)

  const fetchMoreList = () => {
    const new_page = page + 1
    setPage(new_page)
    let params: GetDiscussionParams = {
      page: new_page,
      size: 10,
    }
    getDiscussion(params).then((res) => {
      if (res) {
        setArticleData((pre) => ({
          total: res.total,
          items: [...(pre.items || []), ...(res.items || [])],
        }))
      }
    })
  }

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(name, value)
    return params.toString()
  }

  const fetchList = ({ st = status, se = search, tps = topics }) => {
    setPage(1)
    const params: GetDiscussionParams = {
      page: 1,
      size: 10,
      filter: st as any,
    }

    return getDiscussion(params).then((res) => {
      if (res) {
        setArticleData(res)
      }
    })
  }

  const onInputSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('----')
      redirect(`/?sort=${searchParams.get('sort')}&search=${search}`)
    }
  }

  useEffect(() => {
    setArticleData(data)
  }, [data])

  const handleTopicClick = (t: number) => {
    let newTopics: number[]
    if (topics.includes(t)) {
      // 已选中则取消
      newTopics = topics.filter((item) => item !== t)
    } else {
      // 未选中则添加
      newTopics = [...topics, t]
    }
    // 更新 url 参数
    const params = new URLSearchParams(searchParams.toString())
    params.set('tps', newTopics.join(','))
    router.replace(`/?${params.toString()}`)
  }

  const handleAsk = () => {
    checkAuth(() => releaseModalOpen())
  }

  return (
    <Stack
      gap={0}
      sx={{
        zIndex: 1,
        width: '100%',
        minHeight: '100vh',
        // backgroundColor: '#fff',
      }}
    >
      {/* 横幅区域 */}
      <Box
        sx={{
          mt: '64px',
          width: '100%',
          height: { xs: 200, sm: 300 },
          backgroundImage: 'url(/banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography
          variant='h2'
          sx={{
            color: '#fff',
            fontSize: { xs: 32, sm: 48 },
            fontWeight: 700,
            textAlign: 'center',
            zIndex: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          KoalaQA 社区
        </Typography>
      </Box>

      {/* 搜索栏 */}

      <OutlinedInput
        sx={{
          width: { xs: '90%', sm: 600 },
          height: 48,
          mx: 'auto',
          mt: '-30px',
          mb: 3,
          backgroundColor: '#fff',
          borderRadius: 3,
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
          fontSize: 16,
          boxShadow: '0px 2px 6px 0px rgba(0,0,0,0.1), 0px 2px 6px 0px rgba(218,220,224,0.5)',
          px: 2,
        }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={onInputSearch}
        placeholder='请输入任意内容,使用AI 搜索'
        startAdornment={
          <InputAdornment position='start'>
            <SearchIcon sx={{ color: 'rgba(0,0,0,0.4)', mr: 1 }} />
          </InputAdornment>
        }
      />

      {/* 主要内容区域 */}
      <Stack
        gap={3}
        direction='row'
        alignItems='flex-start'
        sx={{
          width: { xs: '100%', sm: 1200 },
          px: { xs: 2, sm: 0 },
          mx: 'auto',
          mb: { xs: 3, sm: '100px' },
        }}
      >
        <Stack
          gap={2}
          sx={{
            width: 280,
            position: 'sticky',
            top: 20,
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          {!groupsData && groupsLoading ? (
            // 只有在客户端渲染且正在加载时显示骨架屏
            <>
              {[1, 2, 3].map((index) => (
                <Card
                  key={index}
                  sx={{
                    p: 2,
                    boxShadow: 'rgba(0, 28, 85, 0.04) 0px 4px 10px 0px',
                  }}
                >
                  <Stack gap={1}>
                    {[1, 2, 3, 4].map((itemIndex) => (
                      <Box
                        key={itemIndex}
                        sx={{
                          height: 32,
                          backgroundColor: 'rgba(0, 0, 0, 0.06)',
                          borderRadius: 1,
                          animation: 'pulse 1.5s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%': { opacity: 1 },
                            '50%': { opacity: 0.4 },
                            '100%': { opacity: 1 },
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Card>
              ))}
            </>
          ) : (
            groups.origin.map((section) => (
              <Card
                key={section.id}
                sx={{
                  p: 0,
                  boxShadow: 'rgba(0, 28, 85, 0.04) 0px 4px 10px 0px',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Stack gap={0}>
                  {section.items?.map((item, index) => {
                    const colors = ['#206CFF', '#FFA726', '#9C27B0', '#4CAF50']
                    const color = colors[index % colors.length]
                    const icon = '#'

                    return (
                      <Stack
                        direction='row'
                        key={item.id}
                        alignItems='center'
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          backgroundColor: topics.includes(item.id || -1) ? 'rgba(32,108,255,0.06)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(32,108,255,0.06)',
                          },
                        }}
                        onClick={() => handleTopicClick(item.id!)}
                      >
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            backgroundColor: color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: 12,
                            fontWeight: 'bold',
                            mr: 2,
                          }}
                        >
                          {icon}
                        </Box>
                        <Box
                          sx={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: 14,
                            color: topics.includes(item.id || -1) ? 'primary.main' : '#000',
                            fontWeight: topics.includes(item.id || -1) ? 500 : 400,
                          }}
                        >
                          <Typography sx={{ fontSize: 14, fontWeight: 'inherit' }}>{item.name}</Typography>
                        </Box>
                      </Stack>
                    )
                  })}
                </Stack>
              </Card>
            ))
          )}
        </Stack>
        <Stack gap={2} sx={{ width: { xs: '100%', sm: 900 } }}>
          <Stack
            direction='row'
            gap={3}
            justifyContent='space-between'
            alignItems='center'
            sx={{ display: { xs: 'none', sm: 'flex' } }}
          >
            <CusTabs
              sx={{ height: 40, py: '7px' }}
              value={status}
              onChange={(value: Status) => {
                const query = createQueryString('sort', value)
                setStatus(value)
                router.replace(`/?${query}`)
              }}
              list={[
                { label: '热门问题', value: 'hot' },
                { label: '最新问题', value: 'new' },
                { label: '我参与的', value: 'mine', disabled: !user?.email },
              ]}
            />

            <Button
              sx={{
                height: 40,
                backgroundColor: '#333',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#555',
                },
              }}
              variant='contained'
              onClick={handleAsk}
            >
              发帖提问 👉
            </Button>
          </Stack>
          {searchParams.get('search') && (!articleData.items || articleData.items.length === 0) && (
            <Card
              sx={{
                p: 3,
                boxShadow: 'rgba(0, 28, 85, 0.04) 0px 4px 10px 0px',
                textAlign: 'center',
              }}
            >
              <Stack gap={1.5} alignItems='center'>
                <Typography variant='h6'>没搜到想要的答案？发帖提问获取帮助</Typography>
                <Button variant='contained' onClick={handleAsk}>
                  发帖提问
                </Button>
              </Stack>
            </Card>
          )}
          {articleData.items?.map((it) => (
            <React.Fragment key={it.uuid}>
              <DiscussCard data={it} keywords={searchRef.current} />
              <DiscussCardMobile data={it} keywords={searchRef.current} />
            </React.Fragment>
          ))}
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            {page * 10 < (articleData.total || 0) ? (
              <Button
                onClick={fetchMoreList}
                variant='outlined'
                sx={{
                  background: '#fff !important',
                  borderColor: '#fff !important',
                  boxShadow: 'rgba(0, 28, 85, 0.04) 0px 4px 10px 0px',
                  fontWeight: 400,
                  '&:hover': {
                    fontWeight: 500,
                    border: '1px solid #206CFF !important',
                  },
                }}
                fullWidth
              >
                查看更多
              </Button>
            ) : (
              <Divider>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#666',
                  }}
                >
                  到底啦
                </Typography>
              </Divider>
            )}
          </Box>
        </Stack>
        <ReleaseModal
          open={releaseModalVisible}
          onClose={releaseModalClose}
          onOk={() => {
            fetchList({})
            router.refresh()
            releaseModalClose()
          }}
          selectedTags={[]}
          initialTitle={searchParams.get('search') || ''}
        />
      </Stack>
    </Stack>
  )
}

export default Article
