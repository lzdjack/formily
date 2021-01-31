import React from 'react'
import { Card, Empty } from 'antd'
import { CardProps } from 'antd/lib/card'
import {
  useField,
  observer,
  useFieldSchema,
  RecursionField,
} from '@formily/react'
import cls from 'classnames'
import { ISchema } from '@formily/json-schema'
import { usePrefixCls } from '../__builtins__'
import { ArrayBase, ArrayBaseMixins } from '../array-base'

type ComposedArrayCards = React.FC<CardProps> & ArrayBaseMixins

const isAdditionComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Addition') > -1
}

const isIndexComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Index') > -1
}

const isRemoveComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('Remove') > -1
}

const isMoveUpComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('MoveUp') > -1
}

const isMoveDownComponent = (schema: ISchema) => {
  return schema['x-component']?.indexOf('MoveDown') > -1
}

const isOperationComponent = (schema: ISchema) => {
  return (
    isAdditionComponent(schema) ||
    isRemoveComponent(schema) ||
    isMoveDownComponent(schema) ||
    isMoveUpComponent(schema)
  )
}

export const ArrayCards: ComposedArrayCards = observer((props) => {
  const field = useField<Formily.Core.Models.ArrayField>()
  const schema = useFieldSchema()
  const dataSource = Array.isArray(field.value) ? [...field.value] : []
  const prefixCls = usePrefixCls('formily-array-cards', props)
  const renderItems = () => {
    return dataSource?.map((item, index) => {
      const items = Array.isArray(schema.items)
        ? schema.items[index] || schema.items[0]
        : schema.items
      const title = (
        <span>
          <RecursionField
            schema={items}
            name={index}
            mapProperties={(schema) => {
              if (!isIndexComponent(schema)) return false
              return schema
            }}
            onlyRenderProperties
          />
          {props.title || field.title}
        </span>
      )
      const extra = (
        <span>
          <RecursionField
            schema={items}
            name={index}
            mapProperties={(schema) => {
              if (!isOperationComponent(schema)) return false
              return schema
            }}
            onlyRenderProperties
          />
          {props.extra}
        </span>
      )
      const content = (
        <RecursionField
          schema={items}
          name={index}
          mapProperties={(schema) => {
            if (isIndexComponent(schema)) return false
            if (isOperationComponent(schema)) return false
            return schema
          }}
        />
      )
      return (
        <ArrayBase.Item key={index} index={index}>
          <Card
            {...props}
            onChange={() => {}}
            className={cls(`${prefixCls}-item`, props.className)}
            title={title}
            extra={extra}
          >
            {content}
          </Card>
        </ArrayBase.Item>
      )
    })
  }

  const renderAddition = () => {
    return schema.reduceProperties((addition, schema) => {
      if (isAdditionComponent(schema)) {
        return <RecursionField schema={schema} name="addition" />
      }
      return addition
    }, null)
  }

  const renderEmpty = () => {
    if (dataSource?.length) return
    return (
      <Card
        {...props}
        className={cls(`${prefixCls}-item`, props.className)}
        title={props.title || field.title}
        onChange={() => {}}
      >
        <Empty />
      </Card>
    )
  }

  return (
    <ArrayBase>
      {renderEmpty()}
      {renderItems()}
      {renderAddition()}
    </ArrayBase>
  )
})

ArrayCards.displayName = 'ArrayCards'

ArrayBase.mixin(ArrayCards)

export default ArrayCards
