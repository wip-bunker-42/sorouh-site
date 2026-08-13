import { Card, Flex, Stack, Text } from '@sanity/ui'
import type { ObjectInputProps } from 'sanity'

type SeoValue = {
  metaTitle?: string
  metaDescription?: string
  canonicalOverride?: string
  noIndex?: boolean
}

export function SeoFieldInput(props: ObjectInputProps) {
  const value = (props.value ?? {}) as SeoValue
  const titleLength = value.metaTitle?.trim().length ?? 0
  const descriptionLength = value.metaDescription?.trim().length ?? 0

  return (
    <Stack gap={3}>
      <Card padding={3} radius={2} tone={value.noIndex ? 'caution' : 'primary'}>
        <Stack gap={3}>
          <Text size={1} weight="semibold">
            معاينة جودة بيانات البحث
          </Text>
          <Flex gap={4} wrap="wrap">
            <Text size={1}>العنوان: {titleLength}/60</Text>
            <Text size={1}>الوصف: {descriptionLength}/160</Text>
          </Flex>
          <Text muted size={1}>
            الرابط الأساسي يُنشأ تلقائيًا. استخدم التجاوز المتقدم فقط عند وجود سبب تقني واضح.
          </Text>
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  )
}
