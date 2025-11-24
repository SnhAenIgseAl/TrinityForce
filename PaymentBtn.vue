<template>
    <wd-button 
       type="primary"  
       block
       :loading="loading"
       @click="openPaymentWindow" 
    >
        提交订单
    </wd-button>
    <wd-action-sheet
        v-model="visible"
        title="支付方式"
        @closed="loading = false"
    >
        <view class="pay-list">
            <view
                v-for="item in payRadioList"
                :key="item.value"
                class="pay-item"
                @click="paySubmit(item.value)"
            >
                <wd-img
                    :src="item.icon"
                    width="60rpx"
                    height="60rpx"
                />
                {{ item.name }}
            </view>
        </view>
    </wd-action-sheet>
    <wd-toast />
</template>

<script setup lang="ts">
import { submitOrder } from '@/api';
import { useUserStore, useShoppingStore } from '@/stores/index'
import { storeToRefs } from 'pinia';
import { PAYMENT_CONFIG } from '@/config/payment.config'
import { useToast } from 'wot-design-uni';
import ali_logo from '@/assets/images/ali_logo.png'
import wx_logo from '@/assets/images/wx_logo.png'

type PayType = 
    'wxpay' |
    'alipay'

interface PayRadioItem {
    name: string;
    value: PayType;
    icon: string;
}

const toast = useToast()

const {
    userAddress
} = storeToRefs(useUserStore())
const {
    storeInfo,
    orderMode,
    orderList,
    discountInfo
} = storeToRefs(useShoppingStore())

const loading = ref(false)
const visible = ref(false)

const payRadioList: PayRadioItem[] = [
    {
        name: '微信支付',
        value: 'wxpay',
        icon: wx_logo
    },
    {
        name: '支付宝支付',
        value: 'alipay',
        icon: ali_logo
    }
]

// 打开支付窗口
const openPaymentWindow = async () => {
    loading.value = true
    visible.value = true
}

// 提交支付
const paySubmit = async (type: PayType) => {
    if (PAYMENT_CONFIG.REAL) {

        let isPaySuccess: boolean = false

        // 微信支付
        if (type === 'wxpay') {
            isPaySuccess = await new Promise<boolean>((resolve, reject) => {
                uni.requestPayment({
                    provider: 'wxpay',
                    orderInfo: orderList.value,
                    timeStamp: new Date().getTime().toString(),
                    nonceStr: PAYMENT_CONFIG.WXPAY.NONCE_STR,
                    package: PAYMENT_CONFIG.WXPAY.PACKAGE,
                    signType: PAYMENT_CONFIG.WXPAY.SIGN_TYPE, 
                    paySign: PAYMENT_CONFIG.WXPAY.PAY_SIGN,
                    success: (res) => {
                        toast.error(`支付成功`)
                        console.log(res)
                        resolve(true)
                    },
                    fail: (res) => {
                        toast.error(`支付失败：${res}`)
                        console.log(res)
                        resolve(false)
                    }
                })
            })
        }

        // 支付宝支付
        if (type === 'alipay') {
            isPaySuccess = await new Promise<boolean>((resolve, reject) => {
                uni.requestPayment({
                    provider: 'alipay',
                    orderInfo: PAYMENT_CONFIG.ALIPAY.ORDER_INFO,
                    success: (res) => {
                        toast.error(`支付成功`)
                        console.log(res)
                        resolve(true)
                    },
                    fail: (res) => {
                        toast.error(`支付失败：${res}`)
                        console.log(res)
                        resolve(false)
                    }
                })
            })
        }

        if (isPaySuccess) {
            const orderInfo = await submitOrder({
                store: storeInfo.value!.documentId,
                order_mode: orderMode.value,
                order_list: orderList.value,
                order_status: 'production',
                discount: discountInfo.value?.documentId,
                address: userAddress.value?.documentId
            })

            console.log(orderInfo);

            if (orderInfo.code === 0) {
                orderList.value = {}
                discountInfo.value = null

                setTimeout(() => {
                    uni.redirectTo({
                        url: `/pages/order/detail?documentId=${orderInfo.data.documentId}&mode=${orderMode.value}`,
                    })
                }, 300)
            } else {
                toast.error(`提交订单失败：${orderInfo.message}`)
            }
        }
    } else {
        const orderInfo = await submitOrder({
            store: storeInfo.value!.documentId,
            order_mode: orderMode.value,
            order_list: orderList.value,
            order_status: 'production',
            discount: discountInfo.value?.documentId,
            address: userAddress.value?.documentId
        })

        console.log(orderInfo);

        if (orderInfo.code === 0) {
            toast.success(`提交订单成功`)
            orderList.value = {}
            discountInfo.value = null

            setTimeout(() => {
                uni.redirectTo({
                    url: `/pages/order/detail?documentId=${orderInfo.data.documentId}&mode=${orderMode.value}`,
                })
            }, 300)
        } else {
            toast.error(`提交订单失败：${orderInfo.message}`)
        }
    }
}

</script>

<style scoped>

.pay-list {
    display: flex;
    padding: 32rpx;
    gap: 32rpx;
    box-sizing: border-box;
}

.pay-item {
    flex: 1;
    display: flex;
    gap: 32rpx;
    align-items: center;
    text-align: left;
    padding: 32rpx;
    border-radius: 16rpx;
    border: 1px solid #ccc;
}

</style>