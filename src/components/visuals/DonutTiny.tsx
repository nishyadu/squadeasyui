import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts'

export const DonutTiny = ({ bikeShare }: { bikeShare: number }) => {
  const data = [
    { name: 'Bike', value: bikeShare },
    { name: 'Foot', value: 1 - bikeShare },
  ]

  return (
    <div className="h-12 w-12">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} innerRadius={14} outerRadius={24} startAngle={90} endAngle={-270} dataKey="value">
            <Cell key="bike" fill="#38bdf8" />
            <Cell key="foot" fill="#22c55e" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

