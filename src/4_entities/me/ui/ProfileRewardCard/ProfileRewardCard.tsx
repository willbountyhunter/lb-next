'use client'

import { RewardExpandedSchema } from '@/5_shared/gen'
import { Price } from '@/5_shared/ui/Price/Price'
import { getStringDate } from '@/5_shared/utils/getStringDate'
import { Card, Flex, Typography, Button, Tooltip, notification } from 'antd'
import Title from 'antd/es/typography/Title'
import Link from 'next/link'
import { FC, useState } from 'react'
import { profileApi } from '@/4_entities/me'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const ProfileRewardCard: FC<RewardExpandedSchema> = (props) => {
    const [api, contextHolder] = notification.useNotification()
    const queryClient = useQueryClient()

    const isLocked = props.locked_until > new Date().toISOString()

    const { mutateAsync: expireReward, isPending: isExpiring } = useMutation({
        mutationFn: profileApi.expireReward,
        onSuccess: () => {
            api.success({ message: 'Reward expired successfully!' })
            queryClient.invalidateQueries({
                queryKey: profileApi.qkGetProfileRewardsHistory(props.rewarder_id)
            })
        },
        onError: (error: any) => {
            api.error({
                message: 'Failed to expire reward',
                description: error?.message || 'Unknown error'
            })
        }
    })

    async function handleExpireClick() {
        await expireReward(props.id)
    }

    return (
        <>
            {contextHolder}
            <Card>
                <Flex justify="space-between" align="flex-end">
                    <Flex vertical gap="small">
                        <Link href={'/issue/' + props.issue_data.id}>
                            <Title
                                level={5}
                                style={{ marginTop: 0 }}
                            >
                                {props.issue_data.title}&nbsp;
                                <span className="opacity50">#{props.issue_data.issue_number}</span>
                            </Title>
                        </Link>
                    </Flex>
                    <Flex vertical gap="small">
                        <Price amount={props.reward_sats} />
                    </Flex>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Flex gap="small" align="center">
                        <Typography className="opacity85">
                            📅Created at: 
                        </Typography>
                        <Typography className="opacity50">
                            {getStringDate(new Date(props.created_at))}
                        </Typography>
                    </Flex>
                    <Typography>
                        <span className="opacity50">
                            {props.issue_data.is_closed ? 'Closed' : null}
                        </span>
                    </Typography>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Flex gap="small" align="center">
                        <Typography className="opacity85">
                            {isLocked ? "🔒Locked until:" : "🔓Unlocked at:"}
                        </Typography>
                        <Typography className="opacity50">
                            {getStringDate(new Date(props.locked_until))}
                        </Typography>
                    </Flex>
                    <Typography>
                        <span className="opacity50">
                        </span>
                    </Typography>
                </Flex>
                <Flex justify="space-between" align="center">
                    <Flex gap="small" align="center">
                        <Typography className="opacity85">
                            {props.expired_at ? "🗑️ Expired at" : ""}
                        </Typography>
                        <Typography className="opacity50">
                            {props.expired_at ? getStringDate(new Date(props.expired_at)) : ""}
                        </Typography>
                    </Flex>
                    <Typography>
                        <span className="opacity50">
                        </span>
                    </Typography>
                </Flex>
                {!props.expired_at && (
                    <Flex justify="end" style={{ marginTop: '16px' }}>
                        <Tooltip 
                            title={isLocked ? 
                                "Expiry not available; reward is still locked." : 
                                "Clicking Expire will cancel the reward. And return the sats back to your wallet"}
                            >
                            <Button
                                type="primary"
                                disabled={isLocked || isExpiring}
                                loading={isExpiring}
                                onClick={handleExpireClick}
                            >
                                Expire Reward
                            </Button>
                        </Tooltip>
                    </Flex>
                )}
            </Card>
        </>
    )
}

export { ProfileRewardCard }

